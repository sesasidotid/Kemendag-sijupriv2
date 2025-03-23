import { Serializable } from "../../base/commons/serializable";

export class BidangJabatan extends Serializable {
    code: string = undefined;
    jabatanCode: string = undefined;
    name: string = undefined;
    golongan: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}

