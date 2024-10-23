import { Serializable } from "../../base/commons/serializable";

export class PeriodePendaftaran extends Serializable {
    id: string = undefined;
    type: string = undefined;
    startDate: string = undefined;
    endDate: string = undefined;
    notify: boolean = false;
    announcement: string = undefined;

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}