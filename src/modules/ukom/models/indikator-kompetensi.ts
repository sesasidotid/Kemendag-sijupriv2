import { Serializable } from '../../base/commons/serializable'

export class IndikatorKompetensiUkom extends Serializable {
    id: string = undefined
    kompetensi_id: string = undefined
    kompetensiId: string = undefined
    name: string = undefined
    code: string = undefined
    kompetensi: any = undefined

    constructor (object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
