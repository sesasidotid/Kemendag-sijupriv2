import { Serializable } from "../../base/commons/serializable";

export class VerifAKPTask extends Serializable {

    id: string;
    taskAction: "approve" | "reject";
    remark?: string;
    object?: {
        emailAtasan?: string;
        namaAtasan?: string;
        rekomendasiFile?: any;
    }

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}