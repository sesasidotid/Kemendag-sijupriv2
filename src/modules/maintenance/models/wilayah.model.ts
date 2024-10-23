import { Serializable } from "../../base/commons/serializable";

export class Wilayah extends Serializable {
    name: string = undefined;
    code: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}