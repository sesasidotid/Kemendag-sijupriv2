import { Serializable } from '../../base/commons/serializable'

export class KompetensiUkom extends Serializable {
    id: string = undefined
    code: string = undefined
    name: string = undefined
    description: string = undefined
    level: string = undefined
    type: string = undefined
    jabatan_code: string = undefined
    jenjang_code: string = undefined
    bidang_jabatan_code: string = undefined

    constructor (object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
