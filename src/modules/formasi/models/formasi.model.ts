import { Serializable } from "../../../modules/base/commons/serializable";

export class Formasi extends Serializable {
    id: string = undefined;
    waktuPelaksanaan: string = undefined;
    rekomendasi: string = undefined;
    suratUndangan: string = undefined;
    total: string = undefined;
    result: string = undefined;
    unitKerjaId: string = undefined;
    unitKerjaName: string = undefined;
    jabatanCode: string = undefined;
    jabatanName: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}