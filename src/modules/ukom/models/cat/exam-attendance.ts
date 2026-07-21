import { Serializable } from '../../../base/commons/serializable'

export class ExamAttendance extends Serializable {
    id: string = undefined
    startAt: string | null = undefined
    participantId: string = undefined
    finishAt: string | null = undefined
    participantUkomId: string | null = undefined
    examTypeCode: string = undefined
    roomUkomId: string = undefined
    duration: number = undefined
    examScheduleId: string | null = undefined
    violationCount: number = undefined
    status: string | null = undefined
    mouseAwayCount: number = undefined
    // TODO: Change to real field when backend is ready
    isGraded: boolean = undefined // Flag to indicate if examiner has graded this participant

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
