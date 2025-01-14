import { Serializable } from '../../base/commons/serializable'

export class Ukom extends Serializable {
  id: string = undefined
  periodePendaftaranId: string = undefined
  startDate: string = undefined
  endDate: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
