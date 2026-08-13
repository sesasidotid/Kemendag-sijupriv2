import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Router, RouterOutlet } from '@angular/router'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { ApiService } from '@/modules/base/services/api.service'
import { finalize } from 'rxjs'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import { UkomResignationPendingTask } from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'

const RESIGNATION_ENDPOINT = '/api/v1/ukom_resignation' // TODO: sesuaikan path asli
const RESIGNATION_LETTER_KEY = 'resignationLetter'

@Component({
    selector: 'app-ukom-resignation-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ModalComponent,
    ],
    templateUrl: './ukom-resignation-form.component.html',
    styleUrl: './ukom-resignation-form.component.scss',
})
export class UkomResignationFormComponent {
    router = inject(Router)
    fb = inject(FormBuilder)
    handlerService = inject(HandlerService)
    apiService = inject(ApiService)
    userLogin = LoginContext.getUserId()
    participant = signal<Participant | null>(null)
    isLoadingParticipant = signal(true)
    isSubmitting = signal(false)
    resignationSubmission = signal<ParticipantResignation | null>(null)

    showResignationModal: boolean = false
    form: FormGroup

    fileHandlerInputs: FIleHandler = {
        files: {
            [RESIGNATION_LETTER_KEY]: {
                label: 'Surat Pengunduran Diri',
                source: '',
            },
        },
        listen: (key: string, source: string, base64Data: string) => {
            this.form.patchValue({ fileSource: source, fileBase64: base64Data })
        },
        maxSize: 5242880,
        allowedExtensions: ['.pdf'],
        allowedTypes: [{ type: 'application/pdf', label: 'PDF' }],
    }

    constructor() {
        this.form = this.fb.group({
            reason: ['', [Validators.required, Validators.minLength(10)]],
            fileSource: ['', Validators.required],
            fileBase64: ['', Validators.required],
        })
    }

    ngOnInit(): void {
        this.buildParticipantPayload()
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

    buildPayload() {
        const participant = this.participant()
        return {
            participant_id: participant?.id,
            nip: participant?.nip,
            reason: this.form.get('reason')?.value,
            file_surat_pengunduran_diri: this.form.get('fileBase64')?.value,
        }
    }

    buildParticipantPayload() {
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

        this.isLoadingParticipant.set(true)

        this.apiService
            .getData(`/api/v1/participant_ukom/nip/${nip}`)
            .pipe(finalize(() => this.isLoadingParticipant.set(false)))
            .subscribe({
                next: (res: any) => {
                    this.participant.set(res?.data ?? res)
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        err?.error?.message ?? 'Gagal memuat data peserta.',
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

        if (this.form.invalid) {
            this.form.markAllAsTouched()
            this.handlerService.handleAlert(
                'Error',
                'Harap lengkapi alasan dan unggah surat pengunduran diri.',
            )
            return
        }

        this.openResignationModal()
    }

    submitResignation(): void {
        this.isSubmitting.set(true)

        this.apiService
            .postData(`${RESIGNATION_ENDPOINT}/task`, this.buildPayload())
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
}
