import { Serializable } from "../../base/commons/serializable";

export class User extends Serializable {
    id: string = undefined;
    name: string = undefined;
    email: string = undefined;
    password: string = undefined;
    phone?: string = undefined;
    status?: string = undefined;
    dateCreated?: string = undefined;
    roleCodeList: string[] = undefined;
    applicationCode: string = undefined;
    channelCodeList: string[] = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}