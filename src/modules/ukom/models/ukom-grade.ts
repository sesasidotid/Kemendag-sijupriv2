import { Serializable } from '../../base/commons/serializable'

export class UkomGrade extends Serializable {
    id: string = undefined
    nbCat: number = undefined
    catGradeId: string = undefined
    catGradeScore: number = undefined
    nbWawancara: number = undefined
    wawancaraGradeId: string = undefined
    wawancaraGradeScore: number = undefined
    nbSeminar: number = undefined
    seminarGradeId: string = undefined
    seminarGradeScore: number = undefined
    nbPraktik: number = undefined
    praktikGradeId: string = undefined
    praktikGradeScore: number = undefined
    nbPortofolio: number = undefined
    portofolioGradeId: string = undefined
    portofolioGradeScore: number = undefined
    jpm: number = undefined
    score: number = undefined
    ukt: number = undefined
    nbUkt: number = undefined
    ukmsk: number = undefined
    weight: number = undefined
    grade: number = undefined
    passed: boolean = undefined
    status: string = undefined
    roomUkomId: string = undefined
    roomUkomName: string = undefined
    participantId: string = undefined
    participantName: string = undefined
    nip: string = undefined
    rekomendasi: string = undefined
    rekomendasiUrl: string = undefined

    catGrade: Grade = undefined
    wawancaraGrade: Grade = undefined
    seminarGrade: Grade = undefined
    praktikGrade: Grade = undefined
    portofolioGrade: Grade = undefined
    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
type Grade = {
    id: string
    examTypeCode: string
    roomUkomId: string
    participantId: string
    score: string | null
    createdBy: string | null
    dateCreated?: string
    idx?: number
}
