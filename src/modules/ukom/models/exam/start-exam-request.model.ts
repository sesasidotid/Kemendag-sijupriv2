import { Serializable } from '@/modules/base/commons/serializable'

abstract class BaseExamStartRequest extends Serializable {
    examTypeCode: string = undefined
    roomUkomId: string = undefined
    examScheduleId: string = undefined
    secretKey?: string | undefined = undefined

    protected constructor() {
        super()
    }
}

export class ParticipantExamStartRequest extends BaseExamStartRequest {
    constructor(object?: Partial<ParticipantExamStartRequest>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ExaminerExamStartRequest extends BaseExamStartRequest {
    participantId: string = undefined
    constructor(object?: Partial<ExaminerExamStartRequest>) {
        super()
        if (object) this.fromObject(object)
    }
}
