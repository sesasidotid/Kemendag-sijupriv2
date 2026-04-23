import { Serializable } from '@/modules/base/commons/serializable'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

export class ImportQuestionRequest extends Serializable {
    examType: ExamTypeCategory = undefined
    fileQuestion: string = undefined
    uploadSoal?: string = undefined
    listUpload?: ImportQuestionListUpload[]
    constructor(object?: Partial<ImportQuestionRequest>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ImportQuestionListUpload extends Serializable {
    bidangId: string = undefined
    filePdf: string = undefined

    constructor(object?: Partial<ImportQuestionListUpload>) {
        super()
        if (object) this.fromObject(object)
    }
}
