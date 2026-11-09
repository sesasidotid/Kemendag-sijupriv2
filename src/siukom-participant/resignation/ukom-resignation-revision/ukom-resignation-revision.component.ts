import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { BehaviorSubject } from 'rxjs'

const MAX_FILE_SIZE = 5242880 // 5MB
const ALLOWED_EXTENSION = '.pdf'
const ALLOWED_MIME_TYPE = 'application/pdf'

@Component({
    selector: 'app-ukom-resignation-revision',
    standalone: true,
    imports: [CommonModule, LoadingButtonComponent],
    templateUrl: './ukom-resignation-revision.component.html',
    styleUrl: './ukom-resignation-revision.component.scss',
})
export class UkomResignationRevisionComponent {
    @Input() dokumen: any = null
    @Input() show = false
    @Input() remarkDocument: string = null
    @Output() closed = new EventEmitter<void>()

    selectedFile: File | null = null
    selectedFileName: string | null = null
    selectedFileSize: number | null = null
    detectedFileBase64: string | null = null
    fileError: string | null = null
    isDragging: boolean = false
    submitLoading$ = new BehaviorSubject<boolean>(false)
    @Output() submitted = new EventEmitter<{
        file: File
        base64: string
    }>()
    isFileMissing(): boolean {
        return !this.detectedFileBase64
    }

    onClose() {
        this.closed.emit()
    }

    onSave() {
        if (!this.detectedFileBase64) return
        this.submitted.emit({
            file: this.selectedFile,
            base64: this.detectedFileBase64,
        })
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault()
        this.isDragging = true
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault()
        this.isDragging = false
    }

    onDrop(event: DragEvent): void {
        event.preventDefault()
        this.isDragging = false
        const file = event.dataTransfer?.files?.[0]
        if (!file) return
        this.processFile(file)
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return
        this.processFile(file, input)
    }

    private processFile(file: File, input?: HTMLInputElement): void {
        this.fileError = null

        const isValidExtension = file.name
            .toLowerCase()
            .endsWith(ALLOWED_EXTENSION)
        const isValidType = file.type === ALLOWED_MIME_TYPE

        if (!isValidExtension || !isValidType) {
            this.fileError = 'File harus berformat PDF.'
            this.resetFile(input)
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            this.fileError = 'Ukuran file maksimal 5MB.'
            this.resetFile(input)
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            this.selectedFile = file
            this.detectedFileBase64 = reader.result as string
            this.selectedFileName = file.name
            this.selectedFileSize = file.size
        }
        reader.onerror = () => {
            this.fileError = 'Gagal membaca file, silakan coba lagi.'
            this.resetFile(input)
        }
        reader.readAsDataURL(file)
    }

    removeFile(): void {
        this.detectedFileBase64 = null
        this.selectedFileName = null
        this.selectedFileSize = null
        this.fileError = null
    }

    private resetFile(input?: HTMLInputElement): void {
        this.detectedFileBase64 = null
        this.selectedFileName = null
        this.selectedFileSize = null
        if (input) input.value = ''
    }

    formatFileSize(bytes: number): string {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    }
}
