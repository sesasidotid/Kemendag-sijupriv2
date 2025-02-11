import { Serializable } from '../../../base/commons/serializable'

export class RoomUkom extends Serializable {
  id: string = undefined
  name: string = undefined
  jabatan_code: string = undefined
  jabatanName: string = undefined
  jenjang_code: string = undefined
  jenjangName: string = undefined
  participant_quota: string = undefined
  vid_call_link: string = undefined
  vidCallLink: string = undefined
  examStartAt: string = undefined
  examEndAt: string = undefined
  examScheduleDtoList: ExamScheduleDtoList[] = []

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}

export interface ExamScheduleDtoList {
  id: string
  startTime: string
  endTime: string
  examTypeCode: string
  roomUkomId: string
}
