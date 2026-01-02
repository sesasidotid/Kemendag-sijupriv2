import { Serializable } from '@/modules/base/commons/serializable'

abstract class BaseExamAnswer extends Serializable {
    answerText: string | undefined = undefined

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
    questionId!: string
    answerChoice: string | undefined = undefined

    constructor(object?: Partial<WawancaraExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export interface SaveExamAnswerRequest {
    answerDtoList: BaseExamAnswer[]
}
