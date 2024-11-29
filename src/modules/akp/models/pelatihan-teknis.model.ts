import { Serializable } from "../../base/commons/serializable";

export class PelatihanTeknis extends Serializable {
    id: string = undefined;
    code: string = undefined;
    name: string = undefined;
    jabatanCode: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}