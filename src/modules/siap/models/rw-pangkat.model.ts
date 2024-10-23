import { Serializable } from "../../base/commons/serializable";

export class RWPangkat extends Serializable {
    id: string = undefined;
    tmt: Date = undefined;
    skPangkat: string = undefined;
    skPangkatUrl: string = undefined;
    fileSkPangkat: string = undefined;
    pangkatCode: string = undefined;
    pangkatName: string = undefined;
    nip: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}