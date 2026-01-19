export class MultiFileHandler {
    files: { [key: string]: MultiFileConfig }
    viewOnly?: boolean = false
    listen?: (key: string, files: UploadedFile[]) => void
    allowedTypes?: { type: string; label?: string }[]
    allowedExtensions?: string[]
    maxSize?: number // Optional max file size in bytes
    maxFiles?: number // Optional max number of files per key
    errors?: { [key: string]: string } = {} // Store errors for each file key
}

export class MultiFileConfig {
    label?: string
    visible?: () => boolean
    required?: boolean
    id?: string
    remark?: string
    initialFiles?: UploadedFile[] // Pre-populated files
}

export interface UploadedFile {
    id: string
    fileName: string
    base64: string
}
