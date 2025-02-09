import { Serializable } from '../../base/commons/serializable'

export class SysConf extends Serializable {
  code: string = undefined
  name: string = undefined
  value: string = undefined
  type: string = undefined
  rule: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
