import { Serializable } from "../../base/commons/serializable";
import { AKPPendingTaskHistory } from "./pending-task-history.model";

export class AKPTask extends Serializable {
    id: string = undefined;
    objectId: string = undefined;
    objectName: string = undefined;
    objectGroup: string = undefined;
    dateCreated: Date = undefined;
    dateUpdated: Date = undefined;
    comment: string = undefined;
    taskType: string = undefined;
    taskAction: string = undefined;
    taskStatus: string = undefined;
    workflowName: string = undefined;
    workflowTemplate: string = undefined;
    flowName: string = undefined;
    flowId: string = undefined;
    remark: string = undefined;
    instanceId: string = undefined;
    workflowId: string = undefined;
    objectTaskId: string = undefined;
    assignee?: any[] = undefined;
    lastUpdated?: Date = undefined;
    objectTask?: any = undefined;
    pendingTaskHistory: AKPPendingTaskHistory[] = [];

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}