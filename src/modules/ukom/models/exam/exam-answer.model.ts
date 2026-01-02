import { Serializable } from '@/modules/base/commons/serializable'

abstract class BaseExamAnswer extends Serializable {
    answerText: string | undefined = undefined

    protected constructor(object?: Partial<BaseExamAnswer>) {
        super()
        if (object) this.fromObject(object)
    }
}

export class MakalahExamAnswer extends BaseExamAnswer {
    score: number | undefined = undefined

    constructor(object?: Partial<MakalahExamAnswer>) {
        super(object)
    }
}

export class WawancaraExamAnswer extends BaseExamAnswer {
    answerChoice: string | undefined = undefined

    constructor(object?: Partial<WawancaraExamAnswer>) {
        super(object)
    }
}

export interface SaveExamAnswerRequest {
    answerDtoList: BaseExamAnswer[]
}
