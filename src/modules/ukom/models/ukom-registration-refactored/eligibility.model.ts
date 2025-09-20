import { Serializable } from '@/modules/base/commons/serializable'

export class Eligibility extends Serializable {
    eligible: boolean = undefined
    message: string = undefined
    code: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
