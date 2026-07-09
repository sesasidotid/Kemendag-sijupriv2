import { Serializable } from '@/modules/base/commons/serializable'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'

export class ExamScheduleCalendar extends Serializable {
    id: string = undefined
    participantId: string = undefined
    examScheduleId: string = undefined
    personalSchedule: string | null = undefined
    personalScheduleEnd: string | null = undefined
    examSchedule: ExamSchedule
    participantUkom: Participant
    examined: boolean | null = undefined
    examScheduleSupervised: ExamScheduleSupervisedCalendar

    constructor(object?: Partial<ExamScheduleCalendar>) {
        super()
        if (object) this.fromObject(object)
    }
}

export interface ExamScheduleCalendarPayload {
    startDate: string // 2024-01-31
    endDate: string // 2024-02-29
}

interface ExamScheduleSupervisedCalendar {
    id: string
    participantScheduleId: string
    examinerScheduleId: string
    examinerSchedule: examinerSchedule
}

interface examinerSchedule {
    examinerId: string
    examScheduleId: string
    examinerUkom: ExaminerUkom
}
