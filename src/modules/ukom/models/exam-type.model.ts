import { Serializable } from '../../base/commons/serializable'

export class ExamType extends Serializable {
    code: string = undefined
    name: string = undefined
    createdBy: string = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

export enum ExamTypeCategory {
    CAT = 'CAT',
    WAWANCARA = 'WAWANCARA',
    SEMINAR = 'SEMINAR',
    PRAKTIK = 'PRAKTIK',
    MAKALA = 'MAKALA',
    PORTOFOLIO = 'PORTOFOLIO',
    MAKALAH = 'MAKALAH',
}
