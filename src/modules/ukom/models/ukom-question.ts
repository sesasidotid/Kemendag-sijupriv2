import { Serializable } from '../../base/commons/serializable'

export class UkomQuestion extends Serializable {
    id: string = undefined
    question: string | undefined = undefined
    type: string = undefined
    fileAttachment: string | null | undefined = undefined
    attachment: string | null | undefined = undefined
    attachmentUrl: string | null | undefined = undefined
    moduleId: string = undefined
    lastUpdated: string = undefined
    idx: number = undefined
    checked: boolean | undefined = undefined
    questionGroup: UKomQuestionGroup = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

class UKomQuestionGroup extends Serializable {
    id: string = undefined
    association: string = undefined
    associationId: string = undefined
    questionId: string = undefined
    createdBy: string = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
