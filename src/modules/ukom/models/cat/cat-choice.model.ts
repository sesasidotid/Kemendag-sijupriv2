import { Serializable } from '@/modules/base/commons/serializable'

export class CATChoice extends Serializable {
    choiceId: string = undefined
    choiceValue: string = undefined
    correct: boolean = undefined
    questionId: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
