import { Serializable } from '../../base/commons/serializable'

export class KompetensiUkom extends Serializable {
    id: string = undefined
    code: string = undefined
    name: string = undefined
    description: string = undefined
    level: string = undefined
    type: string = undefined
    jabatanCode: string = undefined
    jenjangCode: string = undefined
    bidangJabatanCode: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

export class KompetensiUkomSearchQueryParams extends Serializable {
    eq_jabatanCode?: string = undefined
    eq_jenjangCode?: string = undefined
    eq_bidangJabatanCode?: string = undefined

    constructor(object?: Partial<KompetensiUkomSearchQueryParams>) {
        super()
        if (object) this.fromObject(object)
    }
}
