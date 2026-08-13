import { Router, RouterOutlet } from '@angular/router'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { ApiService } from '@/modules/base/services/api.service'
import { EMPTY, finalize, Observable, tap, BehaviorSubject } from 'rxjs'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import {
    UkomResignationFlowId,
    UkomResignationPendingTask,
} from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'
import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { ResignationDocument } from '@/modules/ukom/models/resignation/resignation-document.model '
import { UkomResignationRevisionComponent } from '../ukom-resignation-revision/ukom-resignation-revision.component'
import { Task } from '@/modules/workflow/models/task.model'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli
const RESIGNATION_LETTER_KEY = 'resignationLetter'

@Component({
    selector: 'app-ukom-resignation-update',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        ModalComponent,
        UkomResignationRevisionComponent,
    ],
    templateUrl: './ukom-resignation-update.component.html',
    styleUrl: './ukom-resignation-update.component.scss',
})
export class UkomResignationUpdateComponent {
    public flowId = UkomResignationFlowId

    private filePreviewService = inject(FilePreviewService)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    router = inject(Router)
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
    resignationData = signal<ParticipantResignation | null>(null)
    selectedDokumen = signal<any>(null)
    showResignationModal: boolean = false
    form: FormGroup
    revisionFileBase64: string | null = null
    revisionFilePreviewUrl: string | null = null

    constructor() {
        this.form = this.fb.group({
            reason: ['', [Validators.required, Validators.minLength(10)]],
            fileSource: ['', Validators.required],
            fileBase64: ['', Validators.required],
        })
    }

    ngOnInit(): void {
        this.buildParticipantPayload().subscribe({
            next: () => {
                this.fetchResignationStatus()
            },
        })
    }

    goBack() {
        this.router.navigate(['/'])
    }

    openResignationModal(): void {
        this.showResignationModal = true
    }

    closeResignationModal(): void {
        this.showResignationModal = false
    }

    preview(source: string) {
        if (!source) return

        window.open(source, '_blank')
    }

    buildRevisionPayload() {
        const participant = this.participant()
        const current = this.resignationData()

        const object = {
            participant_id: participant?.id,
            nip: participant?.nip,

            // Dari form induk
            reason: this.form.get('reason')?.value,

            // Dari modal revisi
            file_surat_pengunduran_diri: this.revisionFileBase64,

            // File lama tetap dipakai jika tidak ada revisi
            surat_pengunduran_diri_url: this.revisionFileBase64
                ? null
                : (current?.suratPengunduranDiriUrl ?? null),
        }

        const task = new Task({
            id: this.pendingTask.id,
            remark: null,
            taskAction: UkomResignationFlowId.UkomResignationFlowId1,
            object: object,
        })

        return task
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
            this.isLoadingParticipant.set(false)
            return
        }
        const nip = userId.replace(/^PU-/, '')

        this.isLoadingResignationStatus.set(true)

        this.apiService
            .getData(
                `${RESIGNATION_ENDPOINT}/task/participant/${this.participant()?.id}`,
            )
            .pipe(finalize(() => this.isLoadingResignationStatus.set(false)))
            .subscribe({
                next: (res: any) => {
                    this.pendingTask = res as UkomResignationPendingTask

                    const resignationDataObject =
                        this.pendingTask.objectTask?.object

                    console.log('ada remark: ', resignationDataObject)

                    this.resignationData.set(
                        resignationDataObject
                            ? new ParticipantResignation(resignationDataObject)
                            : null,
                    )

                    this.form.patchValue({
                        reason: this.resignationData()?.reason ?? '',
                    })
                },
                error: (err) => {
                    console.log(
                        'peserta belum memiliki record pengunduran diri',
                    )
                },
            })
    }

    submit() {
        if (!this.participant()) {
            this.handlerService.handleAlert(
                'Error',
                'Data peserta belum termuat, silakan tunggu sebentar dan coba lagi.',
            )
            return
        }

        this.openResignationModal()
    }

    submitResignation(): void {
        this.isSubmitting.set(true)

        this.apiService
            .postData(
                `${RESIGNATION_ENDPOINT}/task/submit`,
                this.buildRevisionPayload(),
            )
            .pipe(finalize(() => this.isSubmitting.set(false)))
            .subscribe({
                next: (res: any) => {
                    this.resignationSubmission.set(
                        new ParticipantResignation(res?.data ?? res),
                    )
                    this.closeResignationModal()
                    this.handlerService.handleAlert(
                        'Success',
                        'Pengajuan pengunduran diri berhasil dikirim dan menunggu persetujuan.',
                    )

                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                },
                error: (err) => {
                    this.closeResignationModal()
                    this.handlerService.handleAlert(
                        'Error',
                        err?.error?.message ??
                            'Gagal mengirim pengajuan pengunduran diri.',
                    )
                },
            })
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    perbaiki() {
        this.selectedDokumen.set(this.resignationData()?.suratPengunduranDiri)
        this.isModalOpen$.next(true)
    }

    onRevisionSubmitted(document: { file: File; base64: string }) {
        const file = document.file

        this.revisionFileBase64 = document.base64
        this.revisionFilePreviewUrl = URL.createObjectURL(file)

        const current = this.resignationData()
        if (!current) return

        this.resignationData.set(
            new ParticipantResignation({
                ...current,
                suratPengunduranDiri: file.name,
                suratPengunduranDiriUrl: this.revisionFilePreviewUrl,
            }),
        )

        this.isModalOpen$.next(false)
        this.selectedDokumen.set(null)
    }
}
