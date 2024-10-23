import { Serializable } from "../../base/commons/serializable";

export class Instansi extends Serializable {
    id: string = undefined;
    name: string = undefined;
    provinsiId: string = undefined;
    kabupatenId: string = undefined;
    kotaId: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}