import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { CommonModule } from '@angular/common'
import { Component, Input, input, signal } from '@angular/core'

@Component({
    selector: 'app-ukom-resignation-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ukom-resignation-detail.component.html',
    styleUrl: './ukom-resignation-detail.component.scss',
})
export class UkomResignationDetailComponent {
    @Input() resignationData: ParticipantResignation

    inputs: FIleHandler = {
        files: {
            dokumentFile: {
                label: 'Surat Pengunduran Diri',
                fileName: 'Surat Pengunduran Diri.pdf',
                source: 'https://example.com/attachment.pdf',
            },
        },
        viewOnly: true,
        allowedTypes: [{ type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
    }

    constructor(private filePreviewService: FilePreviewService) {}

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }
}
