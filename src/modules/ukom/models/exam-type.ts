import { Serializable } from '../../base/commons/serializable'

export class ExamType extends Serializable {
  code: string = undefined
  name: string = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
