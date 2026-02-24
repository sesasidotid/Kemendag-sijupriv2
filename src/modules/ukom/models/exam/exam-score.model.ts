import { Serializable } from '../../../base/commons/serializable'
import { CATIndicatorCompetency } from '../cat/cat-indicator-competency.model'

/**
 * Base class for all Exam Score models to ensure consistency.
 */
export abstract class BaseScore extends Serializable {
    id: string = undefined
    examScheduleId: string = undefined
    examTypeCode: string = undefined
    roomUkomId: string = undefined
    participantId: string = undefined
    score: string | null = undefined

    protected constructor() {
        super()
    }
}

/**
 * Model for CAT: Questions are nested inside kompetensiIndikatorDtoList.
 * questionDtoList at the root is null.
 */
export class CATScore extends BaseScore {
    questionDtoList: string | null = undefined
    kompetensiIndikatorDtoList: CATIndicatorCompetency[] = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

/**
 * Model for Portfolio: Questions are at the root questionDtoList.
 * Each answer includes a list of validation flags (memadai/valid).
 */
export class PortofolioScore extends BaseScore {
    questionDtoList: Array<{
        id: string
        question: string
        type: string
        weight: number
        answerDto: {
            id: string
            answerText: string | null
            answerUpload: string
            answerUploadUrl: string
            answerList: {
                memadai: boolean
                valid: boolean
            }
        }
    }> = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

/**
 * Model for Studi Kasus: Questions are at the root.
 * Scoring is usually found inside the answerDto of each question.
 */
export class StudiKasusScore extends BaseScore {
    questionDtoList: Array<{
        id: string
        question: string
        type: string
        weight: number
        parentQuestionId: string | null
        answerDto: {
            id: string
            score: number | null
            answerUpload?: string
            answerUploadUrl?: string
            answerText?: string
        }
    }> = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

/**
 * Model for Praktik: Often contains parent/child question relationships.
 */
export class PraktikScore extends BaseScore {
    questionDtoList: Array<{
        id: string
        question: string
        type: string
        weight: number | null
        parentQuestionId: string | null
        answerDto: any | null
    }> = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

/**
 * Model for Makalah & Wawancara: Simple structure with root score.
 */
export class MakalahScore extends BaseScore {
    questionDtoList: any[] = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
