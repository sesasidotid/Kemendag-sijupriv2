import { Serializable } from "../../base/commons/serializable";

export class RWJabatan extends Serializable {
    id: string = undefined;
    tmt: Date = undefined;
    skJabatan: string = undefined;
    skJabatanUrl: string = undefined;
    fileSkJabatan: string = undefined;
    jabatanCode: string = undefined;
    jabatanName: string = undefined;
    jenjangCode: string = undefined;
    jenjangName: string = undefined;
    nip: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}