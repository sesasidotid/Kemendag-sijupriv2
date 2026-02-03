import { Serializable } from '@/modules/base/commons/serializable'

export class FormasiDataDukungModel extends Serializable {
    id: string = undefined
    association: string = undefined
    name: string = undefined
    description: string | null | undefined = undefined
    additional1: unknown = undefined
    additional2: unknown = undefined
    additional3: unknown = undefined
    additional4: unknown = undefined
    additional5: unknown = undefined

    constructor(body: Partial<FormasiDataDukungModel>) {
        super()
        if (body) {
            this.fromObject(body)
        }
    }
}

export class FormasiDataDukungCreateModel extends Serializable {
    id: string = undefined
    name: string = undefined
    association: 'for_formasi' = undefined

    constructor(body: Partial<FormasiDataDukungCreateModel>) {
        super()
        if (body) {
            this.fromObject(body)
        }
    }
}
