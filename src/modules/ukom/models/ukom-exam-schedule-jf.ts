import { Serializable } from '../../base/commons/serializable'

export class UkomExamScheduleJF extends Serializable {
  id: string = undefined
  name: string = undefined
  jabatanCode: string = undefined
  jabatanName: string = undefined
  jenjangCode: string = undefined
  jenjangName: string = undefined
  bidangJabatanCode: string = undefined
  bidangJabatanName: string = undefined
  participantQuota: number = undefined
  examStartAt: string = undefined
  examEndAt: string = undefined
  participantDtoList: any = undefined
  examScheduleDtoList: ExamScheduleDtoList[] = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) {
      this.fromObject(object)
      // Use bracket notation to access properties from the object
      this.examScheduleDtoList = object['examScheduleDtoList']
        ? object['examScheduleDtoList'].map((item: any) => ({
            id: item.id,
            startTime: item.startTime,
            endTime: item.endTime,
            examTypeCode: item.examTypeCode,
            roomUkomId: item.roomUkomId
          }))
        : []
    }
  }
}

export interface ExamScheduleDtoList {
  id: string
  startTime: string
  endTime: string
  examTypeCode: string
  roomUkomId: string
}
