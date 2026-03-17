import { Serializable } from '@/modules/base/commons/serializable'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { ExamAttendance } from '../cat/exam-attendance'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'

export class ExamSchedule extends Serializable {
    id: string = undefined
    startTime: string = undefined
    endTime: string = undefined
    examTypeCode: ExamTypeCategory = undefined
    roomUkomId: string = undefined
    duration: number = undefined
    secretKey: string | null = undefined
    personalSchedule: string | null | undefined = undefined
    participantScheduleList: ParticipantScheduleList[] | undefined | null = []
    examinerScheduleList: ExaminerScheduleList[] | undefined | null = []
    examScheduleParentId: string | null = undefined
    examScheduleChild?: ExamSchedule | null | undefined = undefined
    examAttendance?: ExamAttendance | null | undefined = undefined
    roomUkom?: RoomUkomDetail | null | undefined = undefined
    graded?: boolean | null | undefined = undefined
    examiners?: string

    constructor(object?: Partial<ExamSchedule>) {
        super()
        if (object) this.fromObject(object)
    }
}

interface ParticipantScheduleList {
    id: string
    participantId: string
    examScheduleId: string
    personalSchedule: string | null | undefined
    participantUkom: Participant
    examined?: boolean | null
}

interface ExaminerScheduleList {
    id: string
    examinerId: string
    examScheduleId: string
    examinerUkom: ExaminerUkom
}
