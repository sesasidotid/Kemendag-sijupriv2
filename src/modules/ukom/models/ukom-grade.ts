import { Serializable } from '../../base/commons/serializable'

export class UkomGrade extends Serializable {
    id: string
    nbCat: number
    catGradeId: string
    catGradeScore: number
    nbWawancara: number
    wawancaraGradeId: string
    wawancaraGradeScore: number
    nbSeminar: number
    seminarGradeId: string
    seminarGradeScore: number
    nbPraktik: number
    praktikGradeId: string
    praktikGradeScore: number
    nbPortofolio: number
    portofolioGradeId: string
    portofolioGradeScore: number
    jpm: number
    score: number
    ukt: number
    nbUkt: number
    ukmsk: number
    weight: number
    grade: number
    passed: boolean
    status: string
    roomUkomId: string
    roomUkomName: string
    participantId: string
    participantName: string
    nip: string

    constructor (object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
