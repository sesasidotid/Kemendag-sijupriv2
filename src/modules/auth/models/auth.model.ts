import { Serializable } from "../../base/commons/serializable";

export class Auth extends Serializable {
    clientId: string = undefined;
    clientSecret: string = undefined;
    grantType: string = undefined;
    username: string = undefined;
    password: string = undefined;
    applicationCode: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}