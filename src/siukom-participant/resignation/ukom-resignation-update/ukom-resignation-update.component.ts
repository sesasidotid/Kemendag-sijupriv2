import { Component, Input, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { BehaviorSubject, finalize } from 'rxjs'

import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'

import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { UkomResignationRevisionComponent } from '../ukom-resignation-revision/ukom-resignation-revision.component'

import {
    UkomResignationFlowId,
    UkomResignationPendingTask,
} from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'

import { Task } from '@/modules/workflow/models/task.model'
import { ApiService } from '@/modules/base/services/api.service'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation'

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
    private fb = inject(FormBuilder)
    private handlerService = inject(HandlerService)
    private apiService = inject(ApiService)

    @Input() participant: Participant | null = null
    @Input() pendingTask: UkomResignationPendingTask | null = null

    isModalOpen$ = new BehaviorSubject<boolean>(false)

    isSubmitting = signal(false)

    resignationSubmission = signal<ParticipantResignation | null>(null)

    resignationData = signal<ParticipantResignation | null>(null)

    selectedDokumen = signal<any>(null)

    showResignationModal = false

    form: FormGroup

    revisionFileBase64: string | null = null
    revisionFilePreviewUrl: string | null = null

    constructor() {
        this.form = this.fb.group({
            reason: ['', [Validators.required, Validators.minLength(10)]],
        })
    }

    ngOnInit(): void {
        this.initializeResignationData()
    }

    private initializeResignationData(): void {
        const resignationDataObject = this.pendingTask?.objectTask?.object

        this.resignationData.set(
            resignationDataObject
                ? new ParticipantResignation(resignationDataObject)
                : null,
        )

        this.form.patchValue({
            reason: this.resignationData()?.reason ?? '',
        })
    }

    openResignationModal(): void {
        this.showResignationModal = true
    }

    closeResignationModal(): void {
        this.showResignationModal = false
    }

    preview(source: string): void {
        if (!source) {
            return
        }

        window.open(source, '_blank')
    }

    buildRevisionPayload(): Task | null {
        if (!this.participant) {
            this.handlerService.handleAlert(
                'Error',
                'Data peserta tidak ditemukan.',
            )

            return null
        }

        if (!this.pendingTask) {
            this.handlerService.handleAlert(
                'Error',
                'Data task pengunduran diri tidak ditemukan.',
            )

            return null
        }

        const current = this.resignationData()

        const object = {
            participant_id: this.participant.id,
            nip: this.participant.nip,

            // Dari form
            reason: this.form.get('reason')?.value,

            // File baru hasil revisi
            file_surat_pengunduran_diri: this.revisionFileBase64,

            // Jika tidak ada file baru, gunakan file lama
            surat_pengunduran_diri_url: this.revisionFileBase64
                ? null
                : (current?.suratPengunduranDiriUrl ?? null),
        }

        return new Task({
            id: this.pendingTask.id,
            remark: null,
            taskAction: UkomResignationFlowId.UkomResignationFlowId1,
            object: object,
        })
    }

    submit(): void {
        if (!this.participant) {
            this.handlerService.handleAlert(
                'Error',
                'Data peserta belum termuat, silakan tunggu sebentar dan coba lagi.',
            )

            return
        }

        if (!this.pendingTask) {
            this.handlerService.handleAlert(
                'Error',
                'Data pengajuan pengunduran diri tidak ditemukan.',
            )

            return
        }

        if (this.form.invalid) {
            this.form.markAllAsTouched()

            return
        }

        this.openResignationModal()
    }

    submitResignation(): void {
        const task = this.buildRevisionPayload()

        if (!task) {
            return
        }

        this.isSubmitting.set(true)

        this.apiService
            .postData(`${RESIGNATION_ENDPOINT}/task/submit`, task)
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

    toggleModal(): void {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    perbaiki(): void {
        this.selectedDokumen.set(this.resignationData()?.suratPengunduranDiri)

        this.isModalOpen$.next(true)
    }

    onRevisionSubmitted(document: { file: File; base64: string }): void {
        const file = document.file

        this.revisionFileBase64 = document.base64

        this.revisionFilePreviewUrl = URL.createObjectURL(file)

        const current = this.resignationData()

        if (!current) {
            return
        }

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
