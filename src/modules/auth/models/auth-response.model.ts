import { Serializable } from "../../base/commons/serializable";
import { Menu } from "../../security/models/menu.mode";

export class AuthResponse extends Serializable {
    instansiId: string = undefined;
    unitKerjaId: string = undefined;

    tokenType: string = undefined;
    expiresIn: string = undefined;
    accessToken: string = undefined;
    refreshToken: string = undefined;
    menus: Menu[] = undefined;
    userId: string = undefined;
    applicationCode: string = undefined;
    name: string = undefined;
    roleCodes: string[] = undefined;
    menuCodes: string[] = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}