import { Serializable } from '@/modules/base/commons/serializable'
import { ExamShuffleConfigurationDtoList } from '@/modules/ukom/models/exam-config/exam-config-request.model'

export class ExamConfigModel extends Serializable {
    id: string = undefined
    examScheduleId: string = undefined
    examShuffleConfigurationDtoList: ExamShuffleConfigurationDtoList[] = []
    constructor(object?: Partial<ExamConfigModel>) {
        super()
        if (object) this.fromObject(object)
    }
}
