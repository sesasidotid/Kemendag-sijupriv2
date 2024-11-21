import { Serializable } from "../../base/commons/serializable";

export class ReportGenerate extends Serializable {
    reportId: string = undefined;
    fileType: string = undefined;
    parameter: any = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}