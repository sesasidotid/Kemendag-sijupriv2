import { Serializable } from '@/modules/base/commons/serializable'

export class ExamConfigModel extends Serializable {
    id: string = undefined
    examScheduleId: string = undefined
    examShuffleConfigurationDtoList: ExamShuffleConfigurationDtoList[] = []
    constructor(object?: Partial<ExamConfigModel>) {
        super()
        if (object) this.fromObject(object)
    }
}

interface ExamShuffleConfigurationDtoList {
    id: string
    examConfigurationId: string
    numOfQuestion: number
    kompetensiIndikatorId: string
    kompetensiIndikatorName: string
}
