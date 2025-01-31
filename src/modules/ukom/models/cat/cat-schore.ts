import { Serializable } from '../../../base/commons/serializable'

export class CATSchore extends Serializable {
  id: string = undefined
  examTypeCode: string = undefined
  roomUkomId: string = undefined
  participantId: string = undefined
  score: string = undefined
  kompetensiDtoList: Array<{
    id: string
    code: string
    name: string
    description: any
    type: any
    jabatanCode: string
    jabatanName: any
    jenjangCode: string
    jenjangName: any
    bidangJabatanCode: any
    bidangJabatanName: any
    questionDtoList: Array<{
      id: string
      question: string
      type: string
      fileAttachment: any
      attachment?: string
      attachmentUrl?: string
      moduleId: string
      associationId: any
      association: any
      groupId: any
      multipleChoiceDtoList: Array<{
        choiceId: string
        choiceValue: string
        correct: boolean
        questionId: string
      }>
      answerDto: {
        id: string
        answerText: any
        answerUpload: any
        answerChoice: string
        participantId: string
        questionId: string
        questionType: any
        question: any
      }
    }>
  }> = []

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
