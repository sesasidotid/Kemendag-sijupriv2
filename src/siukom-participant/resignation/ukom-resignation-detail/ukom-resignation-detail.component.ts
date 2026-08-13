import { HandlerService } from '@/modules/base/services/handler.service'
import { ApiService } from '@/modules/base/services/api.service'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { LoginContext } from '@/modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { EMPTY, finalize, Observable, tap } from 'rxjs'
import { UkomResignationPendingTask } from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'
import { Participant } from '@/modules/ukom/models/cat/participant.model'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli

interface PendingTaskResponse {
    objectTask?: {
        object?: Record<string, any>
    }
}

@Component({
    selector: 'app-ukom-resignation-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ukom-resignation-detail.component.html',
    styleUrl: './ukom-resignation-detail.component.scss',
})
export class UkomResignationDetailComponent {
    private handlerService = inject(HandlerService)
    private apiService = inject(ApiService)
    private filePreviewService = inject(FilePreviewService)
    private destroyRef = inject(DestroyRef)
    private userLogin = LoginContext.getUserId()
    participant = signal<Participant | null>(null)
    isLoadingParticipant = signal(true)
    isLoadingResignationStatus = signal(true)
    resignationData = signal<ParticipantResignation | null>(null)
    pendingTask: UkomResignationPendingTask | null = null

    ngOnInit(): void {
        this.buildParticipantPayload().subscribe({
            next: () => {
                this.fetchResignationStatus()
            },
        })
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
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

        return this.apiService
            .getData(`/api/v1/participant_ukom/nip/${nip}`)
            .pipe(
                tap((res: any) => {
                    this.participant.set(res?.data ?? res)

                    console.log('ada participant :? ', this.participant()?.id)
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
            this.isLoadingResignationStatus.set(false)
            return
        }
        const nip = userId.replace(/^PU-/, '')

        this.isLoadingResignationStatus.set(true)

        this.apiService
            .getData(
                `${RESIGNATION_ENDPOINT}/task/participant/${this.participant()?.id}`,
            )
            .pipe(
                finalize(() => this.isLoadingResignationStatus.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (res: PendingTaskResponse) => {
                    this.pendingTask = res as UkomResignationPendingTask

                    const resignationDataObject =
                        this.pendingTask.objectTask?.object

                    this.resignationData.set(
                        resignationDataObject
                            ? new ParticipantResignation(resignationDataObject)
                            : null,
                    )
                    console.log('resignationdata : ', this.resignationData())
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        err?.error?.message ??
                            'Gagal memuat status pengunduran diri.',
                    )
                },
            })
    }
}
