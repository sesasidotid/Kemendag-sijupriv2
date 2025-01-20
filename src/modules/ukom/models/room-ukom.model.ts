import { Serializable } from '../../base/commons/serializable'

export class RoomUkom extends Serializable {
  id: string = undefined
  name: string = undefined
  jabatan_code: string = undefined
  jenjang_code: string = undefined
  participant_quota: string = undefined
  exam_start_at: string = undefined
  exam_end_at: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
