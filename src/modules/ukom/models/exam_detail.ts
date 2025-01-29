import { Serializable } from '../../base/commons/serializable'

export class ExamDetail extends Serializable {
  id: string = undefined
  startTime: string = undefined
  endTime: string = undefined
  examTypeCode: string = undefined
  roomUkomId: string = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
