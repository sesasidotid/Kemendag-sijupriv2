import { Serializable } from '@/modules/base/commons/serializable'

export class FailedTask extends Serializable {
    id: string = undefined
    objectId: string = undefined
    objectName: string = undefined
    objectGroup: string = undefined
    comment: string | null = undefined
    taskType: string = undefined
    taskAction: string = undefined
    taskStatus: string = undefined
    workflowName: string = undefined
    workflowTemplate: string = undefined
    flowName: string = undefined
    flowId: string = undefined
    remark: string = undefined
    instanceId: string = undefined
    workflowId: string = undefined
    objectTaskId: string = undefined
    updatedBy: string | null = undefined
    lastUpdated: string = undefined
    version: number = undefined
    deleteFlag: boolean = undefined
    inactiveFlag: boolean = undefined
    createdBy: string | null = undefined
    dateCreated: string = undefined
    idx: number = undefined
    jenisUkom: string = undefined
    jabatanName: string = undefined
    nextJabatanName: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) {
            this.fromObject(object)
        }
    }
}
