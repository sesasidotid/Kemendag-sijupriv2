import { Serializable } from '@/modules/base/commons/serializable'

abstract class BaseExamAnswer extends Serializable {
    participantId: string = undefined
    questionId: string = undefined
    protected constructor() {
        super()
    }
}

export class MakalahExamAnswer extends BaseExamAnswer {
    score: number | undefined = undefined
    answerText: string | undefined = undefined

    constructor(object?: Partial<MakalahExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class WawancaraExamAnswer extends BaseExamAnswer {
    answerChoice: string | undefined = undefined
    answerText: string | undefined = undefined

    constructor(object?: Partial<WawancaraExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ParticipantPortfolioExamAnswer extends BaseExamAnswer {
    fileAnswerUpload: string | undefined = undefined

    constructor(object?: Partial<ParticipantPortfolioExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ParticipantStudyCaseExamAnswer extends BaseExamAnswer {
    fileAnswerUpload: string | undefined = undefined

    constructor(object?: Partial<ParticipantStudyCaseExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ParticipantPracticalExamAnswer extends BaseExamAnswer {
    fileAnswerUpload: string | undefined = undefined
    answerText: string | undefined = undefined

    constructor(object?: Partial<ParticipantPracticalExamAnswer>) {
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
    fileAnswerUpload?: unknown
    answerList?: {
        valid: boolean
        memadai: boolean
    } | null
}

export interface SaveExamAnswerRequest {
    answerDtoList: ExamAnswerDto[]
}
