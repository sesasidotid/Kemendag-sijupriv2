import { Serializable } from '@/modules/base/commons/serializable'

export class CreateExamScheduleRequest extends Serializable {
    roomUkomId: string = undefined
    startTime: string = undefined
    endTime: string = undefined
    examTypeCode: string = undefined
    duration: number = undefined
    secretKey: string | undefined = undefined
    participantIdList: string[] = []
    examinerIdList: string[] = []

    constructor(object: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
