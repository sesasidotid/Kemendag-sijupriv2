import { Serializable } from '../../../base/commons/serializable'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'

export class RoomUkom extends Serializable {
    id: string = undefined
    name: string = undefined
    jabatan_code: string = undefined
    jabatanName: string = undefined
    jenjang_code: string = undefined
    jenjangName: string = undefined
    bidangJabatanCode: string = undefined
    bidangJabatanName: string = undefined
    participant_quota: string = undefined
    vid_call_link: string = undefined
    vidCallLink: string = undefined
    examStartAt: string = undefined
    examEndAt: string = undefined
    examScheduleDtoList: ExamSchedule[] | undefined | null = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
