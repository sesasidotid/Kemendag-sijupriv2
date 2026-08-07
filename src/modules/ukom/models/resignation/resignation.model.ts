import { Serializable } from '@/modules/base/commons/serializable'
import { Participant } from '../cat/participant.model'
import { ResignationDocument } from './resignation-document.model '

export class ParticipantResignation extends Serializable {
    id: string | null | undefined = undefined
    participantUkom: Participant | null | undefined = undefined
    reason: string | null | undefined = undefined
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | null | undefined = undefined
    createdAt: string | null | undefined = undefined
    updatedAt: string | null | undefined = undefined
    remark?: string | null | undefined = undefined

    documentResignationList: ResignationDocument[] | null | undefined =
        undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
