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

@Component({
    selector: 'app-resignation',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
    ],
    templateUrl: './resignation.component.html',
    styleUrl: './resignation.component.scss',
})
export class ResignationComponent {
    router = inject(Router)
    fb = inject(FormBuilder)
    handlerService = inject(HandlerService)

    form: FormGroup
    isSubmitting = signal(false)
    submissionStatus = signal<'PENDING' | 'APPROVED' | 'REJECTED' | null>(null)

    fileHandlerInputs: FIleHandler = {
        files: {
            resignationLetter: { label: 'Surat Pengunduran Diri', source: '' },
        },
        listen: (key: string, source: string, base64Data: string) => {
            this.form.patchValue({ fileSource: source, fileBase64: base64Data })
        },
        maxSize: 5000000,
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

    submit() {
        if (this.form.invalid) {
            this.handlerService.handleAlert(
                'Error',
                'Harap lengkapi alasan dan unggah surat pengunduran diri.',
            )
            return
        }

        this.isSubmitting.set(true)

        // Mock API call to backend
        setTimeout(() => {
            this.isSubmitting.set(false)
            this.submissionStatus.set('PENDING')
            this.handlerService.handleAlert(
                'Success',
                'Pengajuan pengunduran diri berhasil dikirim dan menunggu persetujuan.',
            )
        }, 1500)
    }
}
