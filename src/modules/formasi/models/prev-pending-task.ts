import { Serializable } from '../../base/commons/serializable'

export class PrevPendingTask extends Serializable {
  id: string = undefined
  formasiStatus: any = undefined
  unitKerjaId: string = undefined
  unitKerjaName: string = undefined
  waktuPelaksanaan: any = undefined
  rekomendasi: any = undefined
  rekomendasiUrl: any = undefined
  fileRekomendasi: any = undefined
  suratUndangan: any = undefined
  suratUndanganUrl: any = undefined
  fileSuratUndangan: any = undefined
  formasiDetailDtoList: any = undefined
  formasiDokumenList: formasiDokumenList[] = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
export interface formasiDokumenList {
  id: any
  dokumen: string
  dokumenUrl: string
  dokumenFile: any
  dokumenPersyaratanId: string
  dokumenPersyaratanName: string
  dokumenStatus: string
  formasiId: any
}
