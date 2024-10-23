import { Serializable } from "../../base/commons/serializable";

export class Pertanyaan extends Serializable {
    id: number = undefined;
    kategoriInstrumentId: string = undefined
    name: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}