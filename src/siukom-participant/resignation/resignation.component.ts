import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { UkomResignationDetailComponent } from './ukom-resignation-detail/ukom-resignation-detail.component'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'

@Component({
    selector: 'app-resignation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ModalComponent,
        UkomResignationDetailComponent,
    ],
    templateUrl: './resignation.component.html',
    styleUrl: './resignation.component.scss',
})
export class ResignationComponent {
    router = inject(Router)
    fb = inject(FormBuilder)
    handlerService = inject(HandlerService)
    showResignationModal: boolean = false
    form: FormGroup
    isSubmitting = signal(false)
    resignationSubmission: ParticipantResignation = new ParticipantResignation()

    fileHandlerInputs: FIleHandler = {
        files: {
            resignationLetter: { label: 'Surat Pengunduran Diri', source: '' },
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
            fileBase64: [''],
        })

        // Mock to get existing status if resuming, let's keep it minimal
        // In real app, fetch status from server
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

    submit() {
        if (this.form.invalid) {
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

        // Mock API
        setTimeout(() => {
            this.isSubmitting.set(false)
            this.resignationSubmission = new ParticipantResignation({
                id: crypto.randomUUID(),
                participantUkom: {
                    id: 'PU-2026-00123',
                    fullName: 'Budi Santoso',
                    nik: '3374012345670001',
                },
                reason: this.form.get('reason')?.value,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                documentResignationList: [
                    {
                        id: crypto.randomUUID(),
                        fileName: 'surat-pengunduran-diri.pdf',
                        fileSource: this.form.get('fileSource')?.value,
                    },
                ],
            })
            this.closeResignationModal()

            this.handlerService.handleAlert(
                'Success',
                'Pengajuan pengunduran diri berhasil dikirim dan menunggu persetujuan.',
            )
        }, 1500)
    }
}
