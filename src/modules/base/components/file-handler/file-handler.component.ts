import { CommonModule } from '@angular/common'
import { Component, ElementRef, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core'
import { FilePreviewService } from '../../services/file-preview.service'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { FileConverterService } from '../../services/file-converter.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { HandlerService } from '../../services/handler.service'

@Component({
    selector: 'app-file-handler',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-handler.component.html',
    styleUrl: './file-handler.component.scss',
})
export class FileHandlerComponent implements OnChanges {
    @ViewChild('container') containerRef!: ElementRef

    @Input() inputs: FIleHandler

    fileNames: { [key: string]: string } = {}
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)
    defaultImage: string = 'assets/eyegil/default-file-handler.jpg'

    isSmallScreen = false
    private resizeObserver!: ResizeObserver

    constructor(
        private filePreviewService: FilePreviewService,
        private fileConverterService: FileConverterService,
        private handlerService: HandlerService,
    ) { }

    getAllowedTypes(): string {
        const typeLabels =
            this.inputs.allowedTypes
                ?.map((t) => t.label ?? t.type)
                .join(', ') || ''
        const extensionLabels = this.inputs.allowedExtensions?.join(', ') || ''

        if (typeLabels && extensionLabels) {
            return `${typeLabels}, ${extensionLabels}`
        }
        return typeLabels || extensionLabels
    }

    ngOnInit() {
        this.loadFiles()
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['inputs'] && !changes['inputs'].firstChange) {
            this.fileNames = {}
            this.loadFiles()
        }
    }

    loadFiles() {
        for (const key in this.inputs.files) {
            if (
                this.inputs.files[key].fileName &&
                this.inputs.files[key].source
            ) {
                this.hadItemsLoading$.next(true)
                this.fileNames[key] = this.inputs.files[key].fileName
                this.fileConverterService
                    .getFileAsBase64(this.inputs.files[key].source)
                    .pipe(finalize(() => {
                        this.hadItemsLoading$.next(false)
                    }))
                    .subscribe({
                        next: (base64) => {
                            this.inputs.listen(
                                key,
                                base64,
                                base64,
                                this.inputs.files[key].label,
                            )
                            this.hadItemsLoading$.next(false)
                        },
                    })
            }
        }
    }

    ngAfterViewInit() {
        this.observeContainerResize()
    }

    observeContainerResize() {
        this.resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width
                this.isSmallScreen = width < 500
            }
        })

        if (this.containerRef) {
            this.resizeObserver.observe(this.containerRef.nativeElement)
        }
    }

    ngOnDestroy() {
        if (this.resizeObserver && this.containerRef) {
            this.resizeObserver.unobserve(this.containerRef.nativeElement)
        }
    }

    clearFileName(key?: string) {
        if (key) {
            delete this.fileNames[key]
            if (this.inputs.files[key]) {
                this.inputs.files[key].source = ''
            }
        } else {
            this.fileNames = {}
            for (const fileKey in this.inputs.files) {
                this.inputs.files[fileKey].source = ''
            }
        }
    }

    /**
     * Get file extension from filename
     */
    private getFileExtension(filename: string): string {
        return filename.toLowerCase().substring(filename.lastIndexOf('.'))
    }

    /**
     * Check if file extension is in allowed extensions list
     */
    private isAllowedExtension(filename: string): boolean {
        if (
            !this.inputs.allowedExtensions ||
            this.inputs.allowedExtensions.length === 0
        ) {
            return false
        }

        const fileExtension = this.getFileExtension(filename)
        return this.inputs.allowedExtensions.some(
            (ext) =>
                ext.toLowerCase() === fileExtension ||
                ext.toLowerCase() === fileExtension.substring(1), // Handle both ".rar" and "rar" formats
        )
    }

    /**
     * Check if file type is in allowed MIME types list
     */
    private isAllowedMimeType(fileType: string): boolean {
        const allowedTypes = this.inputs.allowedTypes?.map((t) => t.type) || []
        return allowedTypes.length === 0 || allowedTypes.includes(fileType)
    }

    handleFileUpload(event: any, key: any) {
        const file = event.target.files[0]

        if (file) {
            // Check file extension first (bypass MIME type check if extension is allowed)
            const isExtensionAllowed = this.isAllowedExtension(file.name)
            const isMimeTypeAllowed = this.isAllowedMimeType(file.type)

            // If we have allowed extensions, check extension first
            // If extension is allowed, bypass MIME type check
            // Otherwise, check MIME type
            if (
                this.inputs.allowedExtensions &&
                this.inputs.allowedExtensions.length > 0
            ) {
                if (!isExtensionAllowed && !isMimeTypeAllowed) {
                    const allowedLabels =
                        this.inputs.allowedTypes?.map(
                            (t) => t.label ?? t.type,
                        ) || []
                    const allAllowed = [
                        ...allowedLabels,
                        ...(this.inputs.allowedExtensions || []),
                    ]

                    this.handlerService.handleAlert(
                        'Error',
                        `Gagal mengunggah file! Jenis file yang diperbolehkan: ${allAllowed.join(', ')}`,
                    )
                    return
                }
            } else {
                // If no allowed extensions specified, only check MIME type
                if (!isMimeTypeAllowed) {
                    const allowedLabels =
                        this.inputs.allowedTypes?.map(
                            (t) => t.label ?? t.type,
                        ) || []

                    this.handlerService.handleAlert(
                        'Error',
                        `Gagal mengunggah file! Jenis file yang diperbolehkan: ${allowedLabels.join(', ')}`,
                    )
                    return
                }
            }

            // Check file size
            if (this.inputs.maxSize && file.size > this.inputs.maxSize) {
                this.handlerService.handleAlert(
                    'Error',
                    `Ukuran file melebihi batas ${this.inputs.maxSize / (1024 * 1024)} MB`,
                )
                return
            }

            const reader = new FileReader()
            reader.onload = (e: any) => {
                const base64Data = e.target.result
                const source = e.target.result
                const label = this.inputs.files[key].label
                const id = this.inputs.files[key].id
                this.inputs.files[key].source = source
                this.fileNames[key] = file.name
                this.inputs.listen(key, source, base64Data, label, id)
            }

            reader.readAsDataURL(file)
        }
    }

    isImage(source: string): boolean {
        if (!source) return false
        return source.startsWith('data:image/')
    }

    previewFile(fileName: string, fileSource: string) {
        this.filePreviewService.open(fileName, fileSource)
    }

    sortByLabel = (
        a: { key: string; value: any },
        b: { key: string; value: any },
    ): number => {
        return a.value.label.localeCompare(b.value.label)
    }
}
