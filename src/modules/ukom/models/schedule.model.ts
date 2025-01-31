import { Serializable } from '../../base/commons/serializable'

export class ExamScheduleUkom extends Serializable {
  id: string
  examScheduleDtoList: ExamScheduleDtoList[]

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}

export interface ExamScheduleDtoList {
  start_time: string
  end_time: string
  exam_type_code: string
}
