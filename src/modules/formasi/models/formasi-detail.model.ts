import { Serializable } from '../../base/commons/serializable'

export class FormasiDetail extends Serializable {
  id: string = undefined
  formasiStatus: string = undefined
  unitKerjaId: string = undefined
  unitKerjaName: any = undefined
  waktuPelaksanaan: any = undefined
  rekomendasi: string = undefined
  rekomendasiUrl: string = undefined
  fileRekomendasi: any = undefined
  suratUndangan: any = undefined
  suratUndanganUrl: any = undefined
  fileSuratUndangan: any = undefined
  formasiDetailDtoList: formasiDetailDtoList[] = []
  formasiDokumenList: formasiDokumenList[] = []

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}

export interface formasiDetailDtoList {
  id: string
  total: number
  result: number
  jabatanCode: string
  jabatanName: string
  formasiId: string
  formasiResultDtoList: formasiResultDtoList[]
}
export interface formasiResultDtoList {
  id: string
  sdm?: string
  pembulatan: number
  result: string
  total: string
  jenjangCode: string
  jenjangName: string
  formasiDetailId: string
}
export interface formasiDokumenList {
  id: any
  dokumen: string
  dokumenUrl: string
  dokumenFile: any
  dokumenPersyaratanId: string
  dokumenPersyaratanName: string
  dokumenStatus: any
  formasiId: any
}
