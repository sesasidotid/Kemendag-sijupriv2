import { Serializable } from '@/modules/base/commons/serializable'

export class CATAnswer extends Serializable {
    id: string = undefined
    answerText: string | null = undefined
    answerUpload: string | null = undefined
    answerUploadUrl: string | null = undefined
    fileAnswerUpload: string | null = undefined
    answerChoice: string | null = undefined
    participantId: string | null = undefined
    questionId: string | null = undefined
    questionType: string | null = undefined
    question: string | null = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

