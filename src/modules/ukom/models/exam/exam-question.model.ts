import { Serializable } from '@/modules/base/commons/serializable'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { CATChoice } from '@/modules/ukom/models/cat/cat-choice.model'
import { ExamAnswerDto } from '@/modules/ukom/models/exam/exam-answer.model'

export class ExamQuestion extends Serializable {
    id: string = undefined
    question: string = undefined
    type: string = undefined
    fileAttachment: string | null | undefined = undefined
    attachment: string | null | undefined = undefined
    attachmentUrl: string | null | undefined = undefined
    moduleId: ExamTypeCategory = undefined
    associationId: string | null | undefined = undefined
    association: unknown = undefined
    groupId: string | null | undefined = undefined
    weight: number | null | undefined = undefined
    hint: string | null | undefined = undefined
    parentQuestionId: string | null | undefined = undefined
    multipleChoiceDtoList: CATChoice[] = undefined
    answerDto: ExamAnswerDto | null = undefined
    kompetensiIndikatorId: string | null | undefined = undefined
    kompetensiIndikatorName: string | null | undefined = undefined

    constructor(object?: Partial<ExamQuestion>) {
        super()
        if (object) this.fromObject(object)
    }
}
