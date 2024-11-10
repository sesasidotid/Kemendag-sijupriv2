import { Serializable } from "../../base/commons/serializable";

export class Jenjang extends Serializable {
    code: string = undefined;
    name: string = undefined;
    kategori: string = undefined;
    description: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}