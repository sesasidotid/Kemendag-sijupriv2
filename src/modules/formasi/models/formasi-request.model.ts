import { Serializable } from '../../base/commons/serializable'
import { FormasiDokumen } from './formasi-dokumen.model'

export class FormasiRequest extends Serializable {
  unitKerjaId: string = undefined
  jabatanCode: string = undefined

  unsurList: any[] = undefined

  formasiDokumenList: FormasiDokumen[] = undefined
  suratUndangan: string = undefined
  fileSuratUndangan: string = undefined

  rekomendasi: string = undefined
  fileRekomendasi: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
