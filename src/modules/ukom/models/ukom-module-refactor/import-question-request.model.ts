import { Serializable } from '@/modules/base/commons/serializable'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

export class ImportQuestionRequest extends Serializable {
    examType: ExamTypeCategory = undefined
    fileQuestion: string = undefined
    uploadSoal?: string = undefined
    uploadSoalList?: ImportQuestionListUpload[]
    constructor(object?: Partial<ImportQuestionRequest>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ImportQuestionListUpload extends Serializable {
    code: string = undefined // indicator code
    file: string = undefined

    constructor(object?: Partial<ImportQuestionListUpload>) {
        super()
        if (object) this.fromObject(object)
    }
}
