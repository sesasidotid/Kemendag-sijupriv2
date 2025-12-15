import { Serializable } from '@/modules/base/commons/serializable'

export class UpdateExamScheduleRequest extends Serializable {
    id: string = undefined
    startTime: string = undefined
    endTime: string = undefined
    duration: number = undefined
    secretKey: string | undefined = undefined
    participantIdList: string[] = []
    examinerIdList: string[] = []

    constructor(object: { [key: string]: string | number }) {
        super()
        if (object) this.fromObject(object)
    }
}
