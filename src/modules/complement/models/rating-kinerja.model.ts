import { Serializable } from '@/modules/base/commons/serializable'

export class RatingKinerja extends Serializable {
    id: string = undefined
    name: string = undefined
    value: number = undefined
    createdBy: string = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
