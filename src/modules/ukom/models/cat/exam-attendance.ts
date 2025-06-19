import { Serializable } from '../../../base/commons/serializable'

export class ExamAttendance extends Serializable {
    id: string = undefined
    startAt: string = undefined
    participantId: string = undefined
    finishAt: string = undefined
    participantUkomId: string = undefined
    examTypeCode: string = undefined
    roomUkomId: string = undefined
    duration: number = undefined

    constructor (object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
