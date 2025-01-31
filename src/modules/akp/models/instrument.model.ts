import { Serializable } from '../../base/commons/serializable'

export class Instrument extends Serializable {
  id: number = undefined
  name: string = undefined
  jabatanJenjangId: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
