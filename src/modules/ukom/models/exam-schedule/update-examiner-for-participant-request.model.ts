import { Serializable } from '@/modules/base/commons/serializable'

export class UpdateExaminerForParticipantRequest extends Serializable {
    participantScheduleId: string = undefined
    examinerScheduleIdList: string[] = []

    constructor(object?: Partial<UpdateExaminerForParticipantRequest>) {
        super()
        if (object) this.fromObject(object)
    }
}
