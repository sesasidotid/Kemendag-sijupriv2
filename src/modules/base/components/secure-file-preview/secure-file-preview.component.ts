import { Component, HostListener, OnInit } from '@angular/core'
import { SecureFilePreviewService } from '../../services/secure-file-preview.service'
import { CommonModule } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { PdfViewerModule } from 'ng2-pdf-viewer'
import * as pdfjsLib from 'pdfjs-dist'
// import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'

// Configure PDF.js worker using static import
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs'

@Component({
    selector: 'app-secure-file-preview',
    standalone: true,
    imports: [CommonModule, PdfViewerModule],
    templateUrl: './secure-file-preview.component.html',
    styleUrl: './secure-file-preview.component.scss',
})
export class SecureFilePreviewComponent implements OnInit {
    fileName: string = ''
    fileSource: any = null
    showModal: boolean = false
    isPdf: boolean = false

    // PDF Viewer controls
    zoom = 1.0
    page = 1
    totalPages = 0

    constructor(
        private filePreviewService: SecureFilePreviewService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        this.filePreviewService.filePreviewObservable.subscribe(
            ({ fileName, fileSource }) => {
                this.open(fileName, fileSource)
            },
        )
    }

    @HostListener('contextmenu', ['$event'])
    onRightClick(event: MouseEvent) {
        event.preventDefault()
    }

    open(fileName: string, fileSource: string) {
        this.fileName = fileName
        this.isPdf = false
        this.page = 1
        this.zoom = 1.0

        let finalUrl: string
        const isBase64 = fileSource.startsWith('data:')

        // Determine if PDF
        if (
            fileName.toLowerCase().endsWith('.pdf') ||
            (isBase64 && fileSource.includes('application/pdf')) ||
            fileSource.toLowerCase().includes('.pdf')
        ) {
            this.isPdf = true
        }

        if (isBase64) {
            // For base64, we might not be able to easily append params if it's treated as a resource
            // But we can try to use object URL
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

        if (this.isPdf) {
            // pdf-viewer takes the URL string directly
            this.fileSource = finalUrl
        } else {
            // For other files, use trusted resource URL for iframe
            this.fileSource =
                this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl)
        }

        this.showModal = true
    }

    callBackFn(pdf: any) {
        this.totalPages = pdf.numPages
    }

    onPdfError(error: any) {
        console.error('PDF Viewer Error:', error)
    }

    zoomIn() {
        this.zoom += 0.1
    }

    zoomOut() {
        if (this.zoom > 0.5) {
            this.zoom -= 0.1
        }
    }

    closeModal() {
        this.showModal = false
        this.fileSource = null // Clear source
    }
}
