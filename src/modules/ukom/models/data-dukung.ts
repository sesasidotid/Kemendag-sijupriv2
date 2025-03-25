import { Serializable } from '../../base/commons/serializable'

export class DataDokumenUkom extends Serializable {
    //   dokumenPersyaratanName: string = undefined
    //   jenisUkom: string = undefined
    id: string = undefined
    dokumen: string = undefined
    dokumenUrl: string = undefined
    dokumenFile: any = undefined
    dokumenPersyaratanId: string = undefined
    dokumenPersyaratanName: string = undefined
    dokumenStatus: any = undefined
    jenisUkom: any = undefined
    participantUkomId: any = undefined
    jabatanCode: any = undefined
    jenjangCode: any = undefined
    jabatanName: any = undefined
    jenjangName: any = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
