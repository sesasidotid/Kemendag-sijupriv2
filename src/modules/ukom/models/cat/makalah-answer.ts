import { Serializable } from '../../../base/commons/serializable'

export class MakalahAnswer extends Serializable {
    currentPage: number = undefined
    data: Daum[] = []
    firstPageUrl: string = undefined
    from: number = undefined
    lastPage: number = undefined
    lastPageUrl: string = undefined
    links: Link[] = []
    nextPageUrl: any = undefined
    path: string = undefined
    perPage: number = undefined
    prevPageUrl: string = undefined
    to: number = undefined
    total: number = undefined

    constructor (object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

export interface Daum {
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
    multipleChoiceDtoList: any[]
    answerDto: AnswerDto
}

export interface AnswerDto {
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

export interface Link {
    url?: string
    label: string
    active: boolean
}
