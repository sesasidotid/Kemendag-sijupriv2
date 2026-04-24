import { Serializable } from '../../base/commons/serializable'
import { KompetensiUkom } from './kompetensi'

export class IndikatorKompetensiUkom extends Serializable {
    id: string = undefined
    name: string = undefined
    code: string = undefined
    kompetensiId: string = undefined
    kompetensi: KompetensiUkom = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

export class IndikatorKompetensiQueryParams extends Serializable {
    eq_kompetensiId?: string = undefined

    constructor(object: Partial<IndikatorKompetensiQueryParams>) {
        super()
        if (object) this.fromObject(object)
    }
}
