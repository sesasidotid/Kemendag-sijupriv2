export class FIleHandler {
    files: { [key: string]: EygileFile }
    viewOnly?: boolean = false
    // listen?: Function
    listen?: (
        key: string,
        source: string,
        base64?: string,
        label?: string,
        id?: string,
    ) => void
    allowedTypes?: { type: string; label?: string }[]
    allowedExtensions?: string[]
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
