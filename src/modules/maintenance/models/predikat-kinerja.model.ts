import { Serializable } from "../../base/commons/serializable";

export class PredikatKinerja extends Serializable {
    id: string = undefined;
    name: string = undefined;
    value: number = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}