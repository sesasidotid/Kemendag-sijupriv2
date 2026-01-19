import { Component, inject, OnInit, signal } from '@angular/core'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'

@Component({
    selector: 'app-studi-kasus-page',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        FormsModule,
    ],
    templateUrl: './studi-kasus-page.component.html',
    styleUrl: './studi-kasus-page.component.scss',
})
export class StudiKasusPageComponent implements OnInit {
    questionLoading = signal(false)
    questionFileUrl: string =
        'https://morth.nic.in/sites/default/files/dd12-13_0.pdf'

    filePreviewService = inject(FilePreviewService)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)
    router = inject(Router)
    answerFile = signal('')
    inputs: FIleHandler = {
        files: {
            answerFile: { label: 'Jawaban Anda' },
        },
        allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
        listen: (key: string, base64Data: string) => {
            this.answerFile.set(base64Data)
        },
    }
    submitLoading = signal(false)

    ngOnInit() {
        this.loadQuestion()
        setTimeout(() => {
            this.questionLoading.set(false)
        }, 2000)
    }

    loadQuestion() {
        this.questionLoading.set(true)
    }

    previewQuestionFile() {
        this.confirmationService
            .open(
                true,
                'Pratinjau File Soal',
                'Silahkan masukkan kode ujian untuk mengunduh soal studi kasus.',
                'Kode Ujian',
                undefined,
                undefined,
                'Masukkan kode ujian di sini...',
            )
            .subscribe({
                next: ({ confirmed, comment }) => {
                    if (!confirmed) return
                    if (!comment) {
                        this.handlerService.handleAlert(
                            'Warning',
                            'Kode ujian tidak valid, pastikan anda memasukkan kode ujian dengan benar.',
                        )
                        return
                    }

                    this.filePreviewService.open(
                        'Studi Kasus.pdf',
                        this.questionFileUrl,
                    )
                },
            })
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    submitAnswer() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.submitLoading.set(true)
                setTimeout(() => {
                    this.submitLoading.set(false)
                    this.handlerService.handleAlert(
                        'Success',
                        'Jawaban studi kasus berhasil diunggah.',
                    )
                }, 2000)
            },
        })
    }
}
