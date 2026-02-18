import { Serializable } from '@/modules/base/commons/serializable'

export class CreatePreviewSuratRekomRequest extends Serializable {
    bulan: string = undefined
    tahun: string = undefined
    tanggal: string = undefined
    jabatanPenandatangan: string = undefined
    namaPenandatangan: string = undefined
    nipPenandatangan: string = undefined
    kopImg: string = undefined

    constructor(body?: Partial<CreatePreviewSuratRekomRequest>) {
        super()
        if (body) {
            this.fromObject(body)
        }
    }
}
