import { Serializable } from '@/modules/base/commons/serializable'

export class CATAnswerState extends Serializable {
    questionId: string = undefined
    isAnswered: boolean = undefined
    isUncertain: boolean = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
