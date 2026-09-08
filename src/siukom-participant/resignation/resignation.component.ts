import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { HandlerService } from '@/modules/base/services/handler.service'
import { UkomResignationDetailComponent } from './ukom-resignation-detail/ukom-resignation-detail.component'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { ApiService } from '@/modules/base/services/api.service'
import { EMPTY, catchError, finalize, Observable, tap } from 'rxjs'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { UkomResignationPendingTask } from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'
import { UkomResignationUpdateComponent } from './ukom-resignation-update/ukom-resignation-update.component'
import { UkomResignationFormComponent } from './ukom-resignation-form/ukom-resignation-form.component'
import { SystemConfigService } from '@/modules/base/services/system-config.service'
import { UkomGradeService } from '@/modules/ukom/services/ukom-grade.service'
import { UkomGrade } from '@/modules/ukom/models/ukom-grade'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli

@Component({
    selector: 'app-resignation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        UkomResignationDetailComponent,
        UkomResignationUpdateComponent,
        UkomResignationFormComponent,
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
    ukomGradeService = inject(UkomGradeService)
    userLogin = LoginContext.getUserId()
    participant = signal<Participant | null>(null)
    isLoadingParticipant = signal(true)
    isLoadingResignationStatus = signal(true)
    isSubmitting = signal(false)
    resignationSubmission = signal<ParticipantResignation | null>(null)
    pendingTask: UkomResignationPendingTask | null = null
    participantNotFound = signal<boolean>(false)
    showResignationModal: boolean = false
    isParticipantAllowToResign = false
    ukomGrade: UkomGrade

    ngOnInit(): void {
        this.buildParticipantPayload().subscribe({
            next: () => {
                this.getParticipantGrade()
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

    private getParticipantGrade(): void {
        this.ukomGradeService
            .findGradeParticipantJF(this.participant()?.id)
            .subscribe({
                next: (response) => {
                    this.ukomGrade = new UkomGrade(response)
                    console.log('grade : ', this.ukomGrade)

                    if (this.ukomGrade) {
                        this.isParticipantAllowToResign = true
                    }
                },
                error: (err) => {
                    console.error('Gagal load ukom grade:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data grade UKOM',
                    )
                },
            })
    }

    private fetchResignationStatus(): void {
        const userId = this.userLogin

        if (!userId) {
            this.handlerService.handleAlert(
                'Error',
                'Sesi login tidak ditemukan.',
            )
            this.isLoadingResignationStatus.set(false)
            return
        }

        this.isLoadingResignationStatus.set(true)

        const participantId = this.participant()?.id

        if (!participantId) {
            this.isLoadingResignationStatus.set(false)
            return
        }

        this.apiService
            .getData(
                `${RESIGNATION_ENDPOINT}/task/participant/${participantId}`,
            )
            .pipe(finalize(() => this.isLoadingResignationStatus.set(false)))
            .subscribe({
                next: (res: any) => {
                    this.pendingTask = res?.data ?? res
                    console.log('ada data pending : ', this.pendingTask)
                },
                error: (err) => {
                    console.log(
                        'peserta belum memiliki record pengunduran diri',
                    )

                    this.pendingTask = null
                },
            })
    }
}
