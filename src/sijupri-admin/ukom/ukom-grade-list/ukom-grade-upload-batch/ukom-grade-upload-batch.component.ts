import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { UkomParticipantService } from '../../../../modules/ukom/services/participant.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { LoadingButtonComponent } from '../../../../modules/base/components/loading-button/loading-button.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { finalize, tap } from 'rxjs'
@Component({
    selector: 'app-ukom-grade-upload-batch',
    standalone: true,
    imports: [CommonModule, FileHandlerComponent, LoadingButtonComponent],
    templateUrl: './ukom-grade-upload-batch.component.html',
    styleUrl: './ukom-grade-upload-batch.component.scss',
})
export class UkomGradeUploadBatchComponent {
    @Output() uploadSuccess = new EventEmitter<void>()

    file: string

    listenFileChange = (key: string, source: string, base64Data: string) => {
        if (key === 'compressed_file') {
            this.file = base64Data
        }
    }

    input: FIleHandler = {
        files: {
            compressed_file: { label: 'File Batch Rekomendasi Hasil UKom' },
        },
        allowedTypes: [
            { type: 'application/x-rar-compressed', label: 'rar' },
            { type: 'application/vnd.rar' },
            { type: 'application/x-rar' },
            { type: 'application/x-compressed' },
        ],
        allowedExtensions: ['.rar'],
        listen: this.listenFileChange,
    }

    isLoading: boolean

    constructor(
        private ukomParticipantService: UkomParticipantService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    uploadRecomendationBatch() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                if (!this.file) {
                    this.handlerService.handleAlert(
                        'Error',
                        'Silakan pilih file terlebih dahulu.',
                    )
                    return
                }

                this.isLoading = true
                this.ukomParticipantService
                    .uploadRecomendationBatch(this.file)
                    .pipe(finalize(() => (this.isLoading = false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'File berhasil diunggah!',
                            )
                            this.uploadSuccess.emit()
                        },
                        error: (err) =>
                            this.handlerService.handleAlert(
                                'Error',
                                `Gagal mengunggah file`,
                            ),
                    })
            },
        })
    }
}
