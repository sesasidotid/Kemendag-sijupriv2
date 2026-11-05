import { Serializable } from '@/modules/base/commons/serializable'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExamAttendance } from '../cat/exam-attendance'

export class ParticipantScheduleList extends Serializable {
    id: string = undefined
    participantId: string = undefined
    examScheduleId: string = undefined
    personalSchedule: string = undefined
    /** Backend relation `hasOne` — only the first examiner (legacy, single-examiner exams) */
    examScheduleSupervised: ExamScheduleSupervised | ExamScheduleSupervised[] | null = undefined
    /** Backend relation `hasMany` — all examiners (multi-examiner exams, e.g. wawancara) */
    examScheduleSupervisedList: ExamScheduleSupervised[] = []
    participantUkom: Participant = undefined
    examined: boolean | null = undefined
    examAttendance?: ExamAttendance

    constructor(object?: Partial<ParticipantScheduleList>) {
        super()
        if (object) this.fromObject(object)
    }
}

export interface ExamScheduleSupervised {
    id: string
    participantScheduleId: string
    examinerScheduleId: string
    /** Waktu penguji ini menyimpan penilaian (null = belum menilai) */
    submittedAt?: string | null
    examinerSchedule?: {
        id: string
        examinerId: string
        examinerUkom?: { name?: string; user?: { name?: string } }
    }
}
