import { Serializable } from '@/modules/base/commons/serializable'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

export class ImportQuestionRequest extends Serializable {
    examType: ExamTypeCategory = undefined
    fileQuestion: string = undefined
    uploadSoal?: string = undefined
    constructor(object?: { [key: string]: string }) {
        super()
        if (object) this.fromObject(object)
    }
}
