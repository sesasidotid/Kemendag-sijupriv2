import { Serializable } from "../../../modules/base/commons/serializable";

export class FormasiDokumen extends Serializable {
    id: string = undefined;
    status: "PENDING" | "APPROVE" | "REJECT";
    dokumenName: string = undefined;
    dokumenFile: string = undefined;
    file: string = undefined;
    file_url: string

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}