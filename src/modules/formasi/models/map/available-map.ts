import { Serializable } from '../../../base/commons/serializable'

export class AvailableFormasiInMap extends Serializable {
  jabatanCode: string = undefined
  jabatanName: string = undefined
  jenjangSumList: Array<{
    jenjangCode: string
    jenjangName: string
    resultSum: string
  }> = []

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
