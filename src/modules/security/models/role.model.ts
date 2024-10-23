import { Serializable } from "../../base/commons/serializable";

export class Role extends Serializable {
    code: string = undefined;
    name: string = undefined;
    applicationCode: string = undefined;
    isCreatable: boolean = true;
    isUpdatable: boolean = true;
    isDeletable: boolean = true;
    menuCodeList: string[] = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}