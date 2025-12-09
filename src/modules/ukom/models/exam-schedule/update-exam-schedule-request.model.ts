import { Serializable } from '@/modules/base/commons/serializable'

export class UpdateExamScheduleRequest extends Serializable {
    id: string = undefined
    startTime: string = undefined
    endTime: string = undefined
    examTypeCode: string = undefined
    duration: number = undefined
    secretKey: string | undefined = undefined

    constructor(object: { [key: string]: string | number }) {
        super()
        if (object) this.fromObject(object)
    }
}
