import { Serializable } from "../../base/commons/serializable";

export class Jabatan extends Serializable {
    code: string = undefined;
    name: string = undefined;
    type: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}