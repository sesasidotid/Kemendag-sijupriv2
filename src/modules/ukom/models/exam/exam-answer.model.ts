import { Serializable } from '@/modules/base/commons/serializable'

abstract class BaseExamAnswer extends Serializable {
    answerText: string | undefined = undefined
    participantId: string = undefined
    questionId: string = undefined
    protected constructor() {
        super()
    }
}

export class MakalahExamAnswer extends BaseExamAnswer {
    score: number | undefined = undefined

    constructor(object?: Partial<MakalahExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class WawancaraExamAnswer extends BaseExamAnswer {
    answerChoice: string | undefined = undefined

    constructor(object?: Partial<WawancaraExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export interface ExamAnswerDto {
    id?: string
    participantId: string
    questionId: string
    answerText?: string | null
    score?: number | null
    answerChoice?: string | null
    answerUpload?: string | null
    answerUploadUrl?: string | null
    questionType?: string | null
    question?: string | null
    isUncertain?: boolean | null
}

export interface SaveExamAnswerRequest {
    answerDtoList: ExamAnswerDto[]
}
