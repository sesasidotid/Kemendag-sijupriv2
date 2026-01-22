import { Serializable } from '@/modules/base/commons/serializable'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'

export class ExaminerScheduleList extends Serializable {
    id: string = undefined
    examinerId: string = undefined
    examScheduleId: string = undefined
    examinerUkom: ExaminerUkom = undefined

    constructor(object?: Partial<ExaminerScheduleList>) {
        super()
        if (object) this.fromObject(object)
    }
}
