import { CommonModule } from '@angular/common'
import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { FilePreviewService } from '../../services/file-preview.service'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { FileConverterService } from '../../services/file-converter.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { HandlerService } from '../../services/handler.service'
import { FileHandlerService } from '../../services/file-handler.service'

@Component({
    selector: 'app-file-handler',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-handler.component.html',
    styleUrl: './file-handler.component.scss',
})
export class FileHandlerComponent {
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
        for (const key in this.inputs.files) {
            if (
                this.inputs.files[key].fileName &&
                this.inputs.files[key].source
            ) {
                this.hadItemsLoading$.next(true)
                this.fileNames[key] = this.inputs.files[key].fileName
                this.fileConverterService
                    .getFileAsBase64(this.inputs.files[key].source)
                    .pipe(
                        finalize(() => {
                            this.hadItemsLoading$.next(false)
                        }),
                    )
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
            const input = document.getElementById(
                'fileInput' + key,
            ) as HTMLInputElement
            if (input) input.value = ''
        } else {
            this.fileNames = {}
            for (const fileKey in this.inputs.files) {
                this.inputs.files[fileKey].source = ''
                const input = document.getElementById(
                    'fileInput' + fileKey,
                ) as HTMLInputElement
                if (input) input.value = ''
            }
        }
    }

    handleFileUpload(event: any, key: any) {
        const file = event.target.files[0]

        if (file) {
            const isValid = this.fileHandlerService.validateFile(file, {
                allowedTypes: this.inputs.allowedTypes,
                allowedExtensions: this.inputs.allowedExtensions,
                maxSize: this.inputs.maxSize,
            })

            if (!isValid) {
                return
            }

            this.fileHandlerService.readFile(file).subscribe({
                next: (base64Data) => {
                    const source = base64Data
                    const label = this.inputs.files[key].label
                    const id = this.inputs.files[key].id
                    this.inputs.files[key].source = source
                    this.fileNames[key] = file.name
                    this.inputs.listen(key, source, base64Data, label, id)
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal membaca file',
                    )
                    console.error('File reading error:', err)
                },
            })
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
