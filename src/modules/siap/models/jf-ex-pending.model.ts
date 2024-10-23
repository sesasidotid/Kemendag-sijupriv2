import { Serializable } from "../../base/commons/serializable";
import { ObjectTask } from "../../workflow/models/object-task.model";
import { JF } from "./jf.model";

export class JFExpectPending extends Serializable {
    isPending: boolean = undefined;
    result: ObjectTask | JF = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}