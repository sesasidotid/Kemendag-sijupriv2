import { Serializable } from '@/modules/base/commons/serializable'

export class ExamSchedule extends Serializable {
    id: string = undefined
    startTime: string = undefined
    endTime: string = undefined
    examTypeCode: string = undefined
    roomUkomId: string = undefined
    duration: number = undefined
    secretKey: string | null = undefined

    constructor(object: { [key: string]: string | number }) {
        super()
        if (object) this.fromObject(object)
    }
}
