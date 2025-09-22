import { Serializable } from '@/modules/base/commons/serializable'

export class DokumenUkom extends Serializable {
    id: string | null = undefined
    dokumen: string | null = undefined
    dokumenUrl: string | null = undefined
    dokumenFile: string | null = undefined
    dokumenPersyaratanId: string | null = undefined
    dokumenPersyaratanName: string | null = undefined
    dokumenStatus: string | null = undefined
    jenisUkom: string | null = undefined
    jabatanCode: string | null = undefined
    jabatanName: string | null = undefined
    jenjangCode: string | null = undefined
    jenjangName: string | null = undefined
    isMengulang: boolean = undefined
    specification: string | null = undefined
    participantUkomId: string | null = undefined
    remark: string | null = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
