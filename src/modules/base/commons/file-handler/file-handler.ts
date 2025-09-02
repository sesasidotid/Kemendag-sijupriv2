export class FIleHandler {
    files: { [key: string]: EygileFile }
    viewOnly?: boolean = false
    listen?: Function
    allowedTypes?: { type: string; label?: string }[]
    allowedExtensions?: string[] // file extensions, e.g. ['rar', 'pdf', 'xlsx']
    maxSize?: number // Optional max file size in bytes
    errors?: { [key: string]: string } = {} // Store errors for each file key
}

export class EygileFile {
    label?: string
    fileName?: string
    source?: string
    visible?: Function
    required?: boolean
    id?: string
    remark?: string
}
