import { Serializable } from '../../../base/commons/serializable'

export class MakalahScore extends Serializable {
    id: string = undefined
    examTypeCode: string = undefined
    roomUkomId: string = undefined
    participantId: string = undefined
    score: string = undefined
    questionDtoList: Array<{
        id: string
        question: string
        type: string
        fileAttachment: any
        attachment: any
        attachmentUrl: any
        moduleId: string
        associationId: any
        association: any
        groupId: any
        multipleChoiceDtoList: any
        answerDto: {
            id: string
            answerText: any
            answerUpload: string
            answerUploadUrl: string
            fileAnswerUpload: any
            answerChoice: any
            participantId: string
            questionId: string
            questionType: any
            question: any
        }
    }> = []

    constructor (object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
