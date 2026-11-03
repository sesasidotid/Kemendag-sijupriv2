import { Serializable } from '@/modules/base/commons/serializable'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExamAttendance } from '../cat/exam-attendance'

export class ParticipantScheduleList extends Serializable {
    id: string = undefined
    participantId: string = undefined
    examScheduleId: string = undefined
    personalSchedule: string = undefined
    examScheduleSupervised: ExamScheduleSupervised[] = []
    participantUkom: Participant = undefined
    examined: boolean | null = undefined
    examAttendance?: ExamAttendance

    constructor(object?: Partial<ParticipantScheduleList>) {
        super()
        if (object) this.fromObject(object)
    }
}

interface ExamScheduleSupervised {
    id: string
    participantScheduleId: string
    examinerScheduleId: string
}
