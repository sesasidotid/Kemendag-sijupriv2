import { Serializable } from '@/modules/base/commons/serializable'

export class ExamConfigRequest extends Serializable {
    examScheduleId: string = undefined
    examShuffleConfigurationDtoList: ExamShuffleConfigurationDtoList[] = []

    constructor(body: Partial<ExamConfigRequest>) {
        super()
        if (body) this.fromObject(body)
    }
}

export interface ExamShuffleConfigurationDtoList {
    numOfQuestion: number
    kompetensiIndikatorId: string
}
