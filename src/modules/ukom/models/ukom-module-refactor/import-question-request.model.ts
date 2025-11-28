import { Serializable } from '@/modules/base/commons/serializable'

export class ImportQuestionRequest extends Serializable {
    exam_type: string = undefined
    file_question: string = undefined

    constructor(object?: { [key: string]: string }) {
        super()
        if (object) this.fromObject(object)
    }
}
