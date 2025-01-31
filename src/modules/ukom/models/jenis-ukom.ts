import { Serializable } from '../../base/commons/serializable'

export class JenisUkom extends Serializable {
  code: string = undefined
  name: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
