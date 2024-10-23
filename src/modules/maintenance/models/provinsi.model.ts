import { Serializable } from "../../base/commons/serializable";

export class Provinsi extends Serializable {
    id: string = undefined;
    name: string = undefined;
    wilayahCode: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}