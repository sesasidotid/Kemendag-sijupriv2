import { Serializable } from '../../base/commons/serializable'

export class Task extends Serializable {
  id: string = undefined
  taskAction: string = undefined
  object: any = undefined
  remark: any = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
