import { Serializable } from "../../../modules/base/commons/serializable";
import { User } from "../../../modules/security/models/user.model";

export class UserUnitKerja extends Serializable {
    nip: string = undefined;
    jenisKelaminCode: string = undefined;
    unitKerjaId: string = undefined;
    name: string = undefined;
    email: string = undefined;
    password: string = undefined;

    phone: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}