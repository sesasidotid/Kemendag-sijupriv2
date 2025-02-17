import { Serializable } from '../../base/commons/serializable'

export class Formasi extends Serializable {
  id: string = undefined
  waktuPelaksanaan: string = undefined
  rekomendasi: string = undefined
  suratUndangan: string = undefined
  total: string = undefined
  result: string = undefined
  unitKerjaId: string = undefined
  unitKerjaName: string = undefined
  jabatanCode: string = undefined
  jabatanName: string = undefined
  formasiId: string = undefined
  formasiResultDtoList: formasiResultDtoList[] = []

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}

export interface formasiResultDtoList {
  id: string
  sdm?: string
  pembulatan?: number
  result: string
  total?: string
  jenjangCode: string
  jenjangName: any
  formasiDetailId: string
}
