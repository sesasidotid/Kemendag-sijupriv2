import { Component, OnInit, Input } from '@angular/core'
import { FilePreviewService } from '../../services/file-preview.service'
import { SafeUrlPipe } from '../../pipes/safe-url.pipe'
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

@Component({
    selector: 'app-file-preview',
    standalone: true,
    imports: [CommonModule, SafeUrlPipe],
    templateUrl: './file-preview.component.html',
    styleUrl: './file-preview.component.scss',
})
export class FilePreviewComponent implements OnInit {
    fileName: string = ''
    fileSource: string = ''
    showModal: boolean = false

    constructor(
        private filePreviewService: FilePreviewService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        this.filePreviewService.filePreviewObservable.subscribe(
            ({ fileName, fileSource }) => {
                this.open(fileName, fileSource)
            },
        )
    }

    //   open (fileName: string, fileSource: string) {
    //     this.fileName = fileName

    //     const isBase64 = fileSource.startsWith('data:')

    //     if (isBase64) {
    //       const mimeMatch = fileSource.match(/^data:(.*?);base64,/)
    //       if (!mimeMatch) {
    //         console.error('Invalid base64 file source')
    //         return
    //       }
    //       const mimeType = mimeMatch[1]
    //       console.log('Detected MIME type:', mimeType)

    //       try {
    //         const base64Data = fileSource.split(',')[1]
    //         const byteCharacters = atob(base64Data)
    //         const byteNumbers = new Array(byteCharacters.length)
    //         for (let i = 0; i < byteCharacters.length; i++) {
    //           byteNumbers[i] = byteCharacters.charCodeAt(i)
    //         }
    //         const byteArray = new Uint8Array(byteNumbers)
    //         const blob = new Blob([byteArray], { type: mimeType })
    //         const url = URL.createObjectURL(blob)

    //         this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(
    //           url
    //         ) as string
    //       } catch (error) {
    //         console.error('Error processing the file:', error)
    //         return
    //       }
    //     } else {
    //       this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(
    //         fileSource
    //       ) as string
    //     }

    //     this.showModal = true
    //   }

    open(fileName: string, fileSource: string) {
        this.fileName = fileName

        let finalUrl: string
        const isBase64 = fileSource.startsWith('data:')

        if (isBase64) {
            const mimeMatch = fileSource.match(/^data:(.*?);base64,/)
            if (!mimeMatch) {
                console.error('Invalid base64 file source')
                return
            }
            const mimeType = mimeMatch[1]
            try {
                const base64Data = fileSource.split(',')[1]
                const byteCharacters = atob(base64Data)
                const byteNumbers = new Array(byteCharacters.length)
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i)
                }
                const byteArray = new Uint8Array(byteNumbers)
                const blob = new Blob([byteArray], { type: mimeType })
                finalUrl = URL.createObjectURL(blob)
            } catch (error) {
                console.error('Error processing the file:', error)
                return
            }
        } else {
            const separator = fileSource.includes('?') ? '&' : '?'
            finalUrl = `${fileSource}${separator}_ts=${Date.now()}`

            // cache-busting param only for remote URLs
            const cacheSeparator = finalUrl.includes('?') ? '&' : '?'
            finalUrl = `${finalUrl}${cacheSeparator}_cache=${Date.now()}`
        }

        this.fileSource = this.sanitizer.bypassSecurityTrustResourceUrl(
            finalUrl,
        ) as string

        console.log('Final URL:', this.fileSource)
        this.showModal = true
    }

    closeModal() {
        this.showModal = false
    }
}
