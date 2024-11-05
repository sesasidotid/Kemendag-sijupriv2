import { Serializable } from "../../base/commons/serializable";

export class AKPPendingTaskHistory extends Serializable {
    id: string = undefined;
    objectId: string = undefined;
    objectName: string = undefined;
    objectGroup: string = undefined;
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
    updatedBy: string = undefined;
    lastUpdated: Date = undefined;
    createdBy: string = undefined;
    dateCreated: Date = undefined;
    
    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}