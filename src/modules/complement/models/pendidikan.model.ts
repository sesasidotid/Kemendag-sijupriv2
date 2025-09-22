import { Serializable } from '@/modules/base/commons/serializable'

export class Pendidikan extends Serializable {
    code: string = undefined
    name: string = undefined
    description: string = undefined
    updatedBy: string = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
