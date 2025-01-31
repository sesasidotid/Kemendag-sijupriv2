import { Serializable } from '../../base/commons/serializable'

export class ExamScheduleUkomList extends Serializable {
  start_time: string = undefined
  end_time: string = undefined
  exam_type_code: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
