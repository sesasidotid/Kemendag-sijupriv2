import { Serializable } from "../../base/commons/serializable";

export class NotificationMessage extends Serializable {
    id: string = undefined;
    title: string = undefined;
    body: string = undefined;
    data: any = undefined;
    read: boolean = undefined;
    dateCreated: string = undefined;
    age: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}