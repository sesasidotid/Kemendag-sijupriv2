export class FIleHandler {
    files: { [key: string]: EygileFile };
    viewOnly?: boolean = false;
    listen?: Function;
}

export class EygileFile {
    label?: string;
    fileName?: string;
    source?: string;
    visible?: Function;
    required?: boolean;
}