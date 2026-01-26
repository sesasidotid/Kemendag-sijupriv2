import { CommonModule } from '@angular/common'
import {
    Component,
    ElementRef,
    Input,
    SimpleChanges,
    ViewChild,
} from '@angular/core'
import { FilePreviewService } from '../../services/file-preview.service'
import {
    MultiFileHandler,
    UploadedFile,
} from '../../commons/file-handler/multi-file-handler'
import { BehaviorSubject } from 'rxjs'
import { HandlerService } from '../../services/handler.service'
import { FileHandlerService } from '../../services/file-handler.service'

@Component({
    selector: 'app-multi-file-handler',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './multi-file-handler.component.html',
    styleUrl: './multi-file-handler.component.scss',
})
export class MultiFileHandlerComponent {
    @ViewChild('container') containerRef!: ElementRef

    @Input() inputs!: MultiFileHandler
    @Input() resetKey?: string

    // Store multiple files per key
    uploadedFiles: { [key: string]: UploadedFile[] } = {}
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)

    isSmallScreen = false
    private resizeObserver!: ResizeObserver

    constructor(
        private filePreviewService: FilePreviewService,
        private handlerService: HandlerService,
        private fileHandlerService: FileHandlerService,
    ) {}

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
        // Initialize uploadedFiles for each key
        for (const key in this.inputs.files) {
            this.uploadedFiles[key] = []

            // Load initial files if provided
            if (this.inputs.files[key].initialFiles?.length) {
                this.uploadedFiles[key] = [
                    ...this.inputs.files[key].initialFiles!,
                ]
                this.notifyListener(key)
            }
        }
    }

    ngAfterViewInit() {
        this.observeContainerResize()
    }

    ngOnChanges(changes: SimpleChanges) {
        // When inputs change, reinitialize with new initial files
        if (changes['inputs'] && !changes['inputs'].firstChange) {
            this.reinitializeFromInputs()
        }

        // When resetKey changes to a new non-null value, reset and reload from inputs
        if (
            changes['resetKey'] &&
            changes['resetKey'].currentValue &&
            changes['resetKey'].currentValue !==
                changes['resetKey'].previousValue
        ) {
            this.resetAllFiles()
        }
    }

    reinitializeFromInputs() {
        // Re-initialize uploadedFiles for each key with new initial files
        for (const key in this.inputs.files) {
            if (!this.uploadedFiles[key]) {
                this.uploadedFiles[key] = []
            }

            // Only reinitialize if there are initial files from server
            if (this.inputs.files[key].initialFiles?.length) {
                this.uploadedFiles[key] = [
                    ...this.inputs.files[key].initialFiles!,
                ]
                this.notifyListener(key)
            }
        }
    }

    resetAllFiles() {
        for (const key in this.uploadedFiles) {
            // Clear existing files
            this.uploadedFiles[key] = []

            // Reload initial files from inputs if provided
            if (this.inputs.files[key]?.initialFiles?.length) {
                this.uploadedFiles[key] = [
                    ...this.inputs.files[key].initialFiles!,
                ]
            }

            this.notifyListener(key)
        }
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

    generateFileId(): string {
        return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    handleFileUpload(event: any, key: string) {
        const file = event.target.files[0]

        if (!file) return

        // Check max files limit
        if (
            this.inputs.maxFiles &&
            this.uploadedFiles[key].length >= this.inputs.maxFiles
        ) {
            this.handlerService.handleAlert(
                'Error',
                `Maksimum ${this.inputs.maxFiles} file per unggahan`,
            )
            return
        }

        const isValid = this.fileHandlerService.validateFile(file, {
            allowedTypes: this.inputs.allowedTypes,
            allowedExtensions: this.inputs.allowedExtensions,
            maxSize: this.inputs.maxSize,
        })

        if (!isValid) {
            // Reset input
            const input = document.getElementById(
                'fileInput' + key,
            ) as HTMLInputElement
            if (input) input.value = ''
            return
        }

        this.fileHandlerService.readFile(file).subscribe({
            next: (base64Data) => {
                const uploadedFile: UploadedFile = {
                    id: this.generateFileId(),
                    fileName: file.name,
                    base64: base64Data,
                }

                this.uploadedFiles[key].push(uploadedFile)
                this.notifyListener(key)

                // Reset the input so the same file can be uploaded again
                const input = document.getElementById(
                    'fileInput' + key,
                ) as HTMLInputElement
                if (input) input.value = ''
            },
            error: (err) => {
                this.handlerService.handleAlert('Error', 'Gagal membaca file')
                console.error('File reading error:', err)
            },
        })
    }

    removeFile(key: string, fileId: string) {
        const index = this.uploadedFiles[key].findIndex((f) => f.id === fileId)
        if (index > -1) {
            this.uploadedFiles[key].splice(index, 1)
            this.notifyListener(key)
        }
    }

    clearAllFiles(key: string) {
        this.uploadedFiles[key] = []
        this.notifyListener(key)
    }

    isImage(source: string): boolean {
        if (!source) return false
        return source.startsWith('data:image/')
    }

    previewFile(fileName: string, fileSource: string) {
        this.filePreviewService.open(fileName, fileSource)
    }

    getFileCount(key: string): number {
        return this.uploadedFiles[key]?.length || 0
    }

    sortByLabel = (
        a: { key: string; value: any },
        b: { key: string; value: any },
    ): number => {
        return a.value.label.localeCompare(b.value.label)
    }

    private notifyListener(key: string) {
        if (this.inputs.listen) {
            this.inputs.listen(key, [...this.uploadedFiles[key]])
        }
    }
}
