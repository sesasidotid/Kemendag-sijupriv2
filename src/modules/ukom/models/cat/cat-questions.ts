import { Serializable } from '../../../base/commons/serializable'
import { CATChoice } from './cat-choice.model'
import { CATAnswer } from './cat-answer.model'
export class CATQuestions extends Serializable {
    id: string = undefined
    question: string = undefined
    type: string = undefined
    fileAttachment: string | null = undefined
    attachment: string | null = undefined
    attachmentUrl: string | null = undefined
    moduleId: string = undefined
    associationId: string | null = undefined
    association: string | null = undefined
    groupId: string | null = undefined
    multipleChoiceDtoList: CATChoice[] = []
    answerDto: CATAnswer = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
