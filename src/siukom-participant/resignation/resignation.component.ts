import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { UkomResignationDetailComponent } from './ukom-resignation-detail/ukom-resignation-detail.component'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { ApiService } from '@/modules/base/services/api.service'
import { EMPTY, catchError, finalize, Observable, tap } from 'rxjs'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import { UkomResignationPendingTask } from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli
const RESIGNATION_LETTER_KEY = 'resignationLetter'

@Component({
    selector: 'app-resignation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ModalComponent,
        RouterOutlet,
    ],
    templateUrl: './resignation.component.html',
    styleUrl: './resignation.component.scss',
})
export class ResignationComponent {
    router = inject(Router)
    route = inject(ActivatedRoute)
    fb = inject(FormBuilder)
    handlerService = inject(HandlerService)
    apiService = inject(ApiService)
    userLogin = LoginContext.getUserId()
    participant = signal<Participant | null>(null)
    isLoadingParticipant = signal(true)
    isLoadingResignationStatus = signal(true)
    isSubmitting = signal(false)
    resignationSubmission = signal<ParticipantResignation | null>(null)
    pendingTask: UkomResignationPendingTask
participantNotFound = signal<boolean>(false)
    showResignationModal: boolean = false

    ngOnInit(): void {
        this.buildParticipantPayload().subscribe({
            next: () => {
                this.fetchResignationStatus()
            },
        })
    }

    buildParticipantPayload(): Observable<any> {
        const userId = this.userLogin

        if (!userId) {
            this.handlerService.handleAlert(
                'Error',
                'Sesi login tidak ditemukan.',
            )
            this.isLoadingParticipant.set(false)

            return EMPTY
        }

        const nip = userId.replace(/^PU-/, '')

        this.isLoadingParticipant.set(true)
        this.participantNotFound.set(false)

        return this.apiService
            .getData(`/api/v1/participant_ukom/nip/${nip}`)
            .pipe(
                tap((res: any) => {
                    const participant = res?.data ?? res

                    this.participant.set(participant)
                }),
                catchError((err) => {
                    if (err?.status === 404) {
                        this.participant.set(null)
                        this.participantNotFound.set(true)

                        return EMPTY
                    }

                    this.handlerService.handleAlert(
                        'Error',
                        err?.error?.message ??
                            'Gagal memuat data peserta UKOM.',
                    )

                    return EMPTY
                }),
                finalize(() => this.isLoadingParticipant.set(false)),
            )
    }

    private fetchResignationStatus(): void {
        const userId = this.userLogin
        if (!userId) {
            this.handlerService.handleAlert(
                'Error',
                'Sesi login tidak ditemukan.',
            )
            this.isLoadingParticipant.set(false)
            return
        }
        const nip = userId.replace(/^PU-/, '')

        this.isLoadingResignationStatus.set(true)
        console.log('participant : ', this.participant()?.id)
        this.apiService
            .getData(
                `${RESIGNATION_ENDPOINT}/task/participant/${this.participant()?.id}`,
            )
            .pipe(finalize(() => this.isLoadingResignationStatus.set(false)))
            .subscribe({
                next: (res: any) => {
                    this.pendingTask = res

                    if (!this.pendingTask) {
                        this.router.navigate(['create'], {
                            relativeTo: this.route,
                        })
                        return
                    }

                    const { flowId, taskStatus } = this.pendingTask

                    if (
                        flowId === 'resignation_flow_1' &&
                        (taskStatus === 'COMPLETED' || taskStatus === 'PENDING')
                    ) {
                        this.router.navigate(['nip', nip, 'detail'], {
                            relativeTo: this.route,
                        })
                    } else if (
                        flowId === 'resignation_flow_2' &&
                        taskStatus === 'PENDING'
                    ) {
                        this.router.navigate(['nip', nip, 'update'], {
                            relativeTo: this.route,
                        })
                    } else {
                        this.router.navigate(['nip', nip], {
                            relativeTo: this.route,
                        })
                    }
                },
                error: (err) => {
                    console.log(
                        'peserta belum memiliki record pengunduran diri',
                    )
                    // Error (misal 404) diasumsikan berarti belum ada resignation -> create
                    this.router.navigate(['create'], {
                        relativeTo: this.route,
                    })
                },
            })
    }
}
