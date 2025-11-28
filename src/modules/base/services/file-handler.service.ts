import { Injectable } from '@angular/core'
import { Observable, Observer } from 'rxjs'
import { HandlerService } from './handler.service'

export interface FileHandlerOptions {
    allowedTypes?: { label?: string; type: string }[]
    allowedExtensions?: string[]
    maxSize?: number // in bytes
}

@Injectable({
    providedIn: 'root',
})
export class FileHandlerService {
    constructor(private handlerService: HandlerService) {}

    /**
     * Validate a file based on options.
     * Returns true if valid, false otherwise.
     * Displays an alert via HandlerService if invalid.
     */
    validateFile(file: File, options: FileHandlerOptions): boolean {
        // Check file extension first (bypass MIME type check if extension is allowed)
        const isExtensionAllowed = this.isAllowedExtension(
            file.name,
            options.allowedExtensions,
        )
        const isMimeTypeAllowed = this.isAllowedMimeType(
            file.type,
            options.allowedTypes,
        )

        // If we have allowed extensions, check extension first
        // If extension is allowed, bypass MIME type check
        // Otherwise, check MIME type
        if (options.allowedExtensions && options.allowedExtensions.length > 0) {
            if (!isExtensionAllowed && !isMimeTypeAllowed) {
                const allowedLabels =
                    options.allowedTypes?.map((t) => t.label ?? t.type) || []
                const allAllowed = [
                    ...allowedLabels,
                    ...(options.allowedExtensions || []),
                ]

                this.handlerService.handleAlert(
                    'Error',
                    `Gagal mengunggah file! Jenis file yang diperbolehkan: ${allAllowed.join(', ')}`,
                )
                return false
            }
        } else {
            // If no allowed extensions specified, only check MIME type
            if (!isMimeTypeAllowed) {
                const allowedLabels =
                    options.allowedTypes?.map((t) => t.label ?? t.type) || []

                this.handlerService.handleAlert(
                    'Error',
                    `Gagal mengunggah file! Jenis file yang diperbolehkan: ${allowedLabels.join(', ')}`,
                )
                return false
            }
        }

        // Check file size
        if (options.maxSize && file.size > options.maxSize) {
            this.handlerService.handleAlert(
                'Error',
                `Ukuran file melebihi batas ${options.maxSize / (1024 * 1024)} MB`,
            )
            return false
        }

        return true
    }

    /**
     * Read file as Base64 string.
     */
    readFile(file: File): Observable<string> {
        return new Observable((observer: Observer<string>) => {
            const reader = new FileReader()
            reader.onload = (e: any) => {
                observer.next(e.target.result)
                observer.complete()
            }
            reader.onerror = (error) => {
                observer.error(error)
            }
            reader.readAsDataURL(file)
        })
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
    private isAllowedExtension(
        filename: string,
        allowedExtensions?: string[],
    ): boolean {
        if (!allowedExtensions || allowedExtensions.length === 0) {
            return false
        }

        const fileExtension = this.getFileExtension(filename)
        return allowedExtensions.some(
            (ext) =>
                ext.toLowerCase() === fileExtension ||
                ext.toLowerCase() === fileExtension.substring(1), // Handle both ".rar" and "rar" formats
        )
    }

    /**
     * Check if file type is in allowed MIME types list
     */
    private isAllowedMimeType(
        fileType: string,
        allowedTypes?: { label?: string; type: string }[],
    ): boolean {
        const types = allowedTypes?.map((t) => t.type) || []
        return types.length === 0 || types.includes(fileType)
    }
}
