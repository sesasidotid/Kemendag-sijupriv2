import { Serializable } from "../../base/commons/serializable";

export class FcmToken extends Serializable {
    token: string = undefined;
    deviceId: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}