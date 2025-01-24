import { Serializable } from '../../../modules/base/commons/serializable'

export class ObjectTask extends Serializable {
  id: string = undefined
  property: string = undefined
  object: any = undefined
  prevObject: any = undefined
  object_old: any = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
