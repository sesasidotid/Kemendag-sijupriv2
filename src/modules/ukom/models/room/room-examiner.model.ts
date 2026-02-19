import { Serializable } from '@/modules/base/commons/serializable'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'

export class RoomExmainer extends Serializable {
    id: string | null | undefined = undefined
    examinerId: string | null | undefined = undefined
    roomId: string | null | undefined = undefined
    examinerUkom: ExaminerUkom | null | undefined = undefined

    constructor(body?: Partial<RoomExmainer>) {
        super()
        if (body) {
            this.fromObject(body)
        }
    }
}
