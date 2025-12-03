import { Serializable } from '@/modules/base/commons/serializable'
import { CATQuestions } from './cat-questions'
export class CATIndicatorCompetency extends Serializable {
    id: string = undefined
    code: string = undefined
    name: string = undefined
    kompetensiId: string = undefined
    kompetensiName: string = undefined
    questionDtoList: CATQuestions[] = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
