import { UkomTaskDetail } from '@/modules/ukom/models/ukom-task-detail.modal'
import { Serializable } from '../commons/serializable'
export class NonJFParticipant extends Serializable {
    status: string | boolean = undefined
    data: UkomTaskDetail = undefined
    constructor(object: { [key: string]: string | number | boolean | null }) {
        super()
        if (object) this.fromObject(object)
    }
}
