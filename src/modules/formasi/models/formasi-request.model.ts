import { Serializable } from '../../base/commons/serializable'
import { FormasiDokumen } from './formasi-dokumen.model'

export class FormasiRequest extends Serializable {
  formasiId: string = undefined

  unitKerjaId: string = undefined
  jabatanCode: string = undefined

  unsurList: any[] = undefined
  unsurDtoList: any[] = undefined

  //   formasiDokumenList: FormasiDokumen[] = undefined
  formasiDokumenList: any[] = undefined

  suratUndangan: string = undefined
  fileSuratUndangan: string = undefined
  //   formasi_dokumen_list: FormasiDokumen[] = undefined
  formasi_dokumen_list: any[] = undefined

  rekomendasi: string = undefined
  fileRekomendasi: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
