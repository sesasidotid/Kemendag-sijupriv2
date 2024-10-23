import { Serializable } from "../../../modules/base/commons/serializable";

export class FormasiResult extends Serializable {
    total: number = undefined;
    sdm: number = undefined;
    pembulatan: number = undefined;
    jenjangCode: string = undefined;
    jenjangName: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}