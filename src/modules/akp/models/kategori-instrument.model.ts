import { Serializable } from "../../base/commons/serializable";
import { Pertanyaan } from "./pertanyaan.model";

export class KategoriInstrument extends Serializable {
    id: number = undefined;
    instrumentId: string = undefined
    instrumentName: string = undefined
    name: string = undefined;
    jabatanJenjangId: string = undefined;

    pertanyaanList: Pertanyaan[] = [];

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}