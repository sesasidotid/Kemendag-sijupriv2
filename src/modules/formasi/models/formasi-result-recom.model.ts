import { Serializable } from '../../base/commons/serializable'

export class ResultRecommened extends Serializable {
  id: string = undefined
  total: number = undefined
  result: number = undefined
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
