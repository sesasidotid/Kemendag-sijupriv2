import { Serializable } from '../../base/commons/serializable'

export class UkomQuestion extends Serializable {
  id: string = undefined
  question: string = undefined
  type: string = undefined
  attachment: any = undefined
  moduleId: string = undefined
  updatedBy: any = undefined
  lastUpdated: string = undefined
  version: number = undefined
  deleteFlag: boolean = undefined
  inactiveFlag: boolean = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined
  checked: boolean = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
