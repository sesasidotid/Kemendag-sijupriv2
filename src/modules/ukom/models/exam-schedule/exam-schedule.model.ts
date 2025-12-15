import { Serializable } from '@/modules/base/commons/serializable'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

export class ExamSchedule extends Serializable {
    id: string = undefined
    startTime: string = undefined
    endTime: string = undefined
    examTypeCode: ExamTypeCategory = undefined
    roomUkomId: string = undefined
    duration: number = undefined
    secretKey: string | null = undefined
    participantScheduleList: ParticipantScheduleList[] | undefined = undefined
    examinerScheduleList: ExaminerScheduleList[] | undefined = undefined

    constructor(object?: { [key: string]: string | number }) {
        super()
        if (object) this.fromObject(object)
    }
}

interface ParticipantScheduleList {
    id: string
    participantId: string
    examScheduleId: string
    participantUkom: Participant
}

interface ExaminerScheduleList {
    id: string
    examinerId: string
    examScheduleId: string
    examinerUkom: ExaminerUkom
}
