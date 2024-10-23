import { Serializable } from "../../base/commons/serializable";

export class RWKompetensi extends Serializable {
    id: string = undefined;
    name: string = undefined;
    tglSertifikat: Date = undefined;
    dateStart: Date = undefined;
    dateEnd: Date = undefined;
    sertifikat: string = undefined;
    sertifikatUrl: string = undefined;
    fileSertifikat: string = undefined;
    kategoriPengembanganId: string = undefined;
    kategoriPengembanganName: string = undefined;
    kategoriPengembanganValue: string = undefined;
    nip: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}