export class HttpException extends Error {
    code: string = undefined;
    params: any = undefined;

    constructor(code?: string, message?: string, params?: any) {
        super(message);
        this.code = code;
        this.message = message;
        this.params = params;
    }
}