import { Serializable } from "../../base/commons/serializable";

export class Menu extends Serializable {
    code: string = undefined;
    name: string = undefined;
    level: number = undefined;
    type: string = undefined;
    path: string = undefined;
    fullPath: string = undefined;
    active: boolean = undefined;
    access: any = undefined;
    icon: string = undefined;
    parentMenuCode: string = undefined;
    child: Menu[] = undefined;
    checked: boolean = false;

    isCreatable: boolean = undefined;
    isUpdatable: boolean = undefined;
    isDeletable: boolean = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}