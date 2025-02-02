import { Serializable } from '../../base/commons/serializable'

export class AvailableFormation extends Serializable {
  code: string = undefined
  type: string = undefined
  name: string = undefined
  description: string = undefined
  updatedBy: string = undefined
  lastUpdated: string = undefined
  version: number = undefined
  deleteFlag: boolean = undefined
  inactiveFlag: boolean = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
