import { Serializable } from '@/modules/base/commons/serializable'
import { DokumenUkom } from './document.model'
import { ResignationDocument } from '../resignation/resignation-document.model '
import { Participant } from '../cat/participant.model'
import { ParticipantResignation } from '../resignation/resignation.model'

export enum UkomResignationFlowId {
    UkomResignationFlowId1 = 'resignation_flow_1',
    UkomResignationFlowId2 = 'resignation_flow_2',
    UkomResignationRevision = 'reject',
    UkomResignationApproved = 'approve',
}

export enum ParticipantStatus {
    JF = 'jf',
    NonJF = 'non_jf',
}
export class UkomResignationPendingTask extends Serializable {
    id: string = undefined
    objectId: string = undefined
    objectName: string = undefined
    objectGroup: string = undefined
    comment: string | null = undefined
    taskType: string = undefined
    taskAction: string | null = undefined
    taskStatus: string = undefined
    workflowName: string = undefined
    workflowTemplate: string = undefined
    flowName: string = undefined
    flowId: UkomResignationFlowId = undefined
    remark: string | null = undefined
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

    objectTask: ObjectTask = undefined

    constructor(object?: any) {
        super()
        if (object) {
            this.fromObject(object)
            if (object.objectTask)
                this.objectTask = new ObjectTask(object.objectTask)
        }
    }
}

export class ObjectTask extends Serializable {
    id: string = undefined
    property: string | null = undefined
    object: ParticipantResignation = undefined
    prevObject: ParticipantResignation = undefined
    oldObject: any = undefined
    updatedBy: string | null = undefined
    lastUpdated: string = undefined
    version: number = undefined
    deleteFlag: boolean = undefined
    inactiveFlag: boolean = undefined
    createdBy: string | null = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: any) {
        super()

        if (object) {
            this.fromObject(object)

            if (object.object)
                this.object = new ParticipantResignation(object.object)

            if (object.prevObject)
                this.prevObject = new ParticipantResignation(object.prevObject)
        }
    }
}

export class ParticipantObject extends Serializable {
    id: string = undefined
    name: string = undefined
    email: string = undefined
    phone: string = undefined
    userDetails: any = undefined
    status: string | null = undefined
    roleCodeList: string[] = []
    password: string | null = undefined
    applicationCode: string = undefined
    channelCodeList: string[] = []
    participantId: string = undefined
    participantUkom: Participant = undefined
    suratPengunduranDiriUrl: string | null | undefined = undefined
    suratPengunduranDiri: string | null | undefined = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
