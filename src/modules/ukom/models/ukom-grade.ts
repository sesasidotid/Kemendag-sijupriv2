import { Serializable } from '../../base/commons/serializable'

export class UkomGrade extends Serializable {
    id: string = undefined
    nbCat: number | null = undefined
    catGradeId: string | null = undefined
    catGradeScore: number | null = undefined
    nbWawancara: number | null = undefined
    wawancaraGradeId: string | null = undefined
    wawancaraGradeScore: number | null = undefined
    nbSeminar: number | null = undefined
    seminarGradeId: string | null = undefined
    seminarGradeScore: number | null = undefined
    nbPraktik: number | null = undefined
    praktikGradeId: string | null = undefined
    praktikGradeScore: number | null = undefined
    nbPortofolio: number | null = undefined
    portofolioGradeId: string | null = undefined
    portofolioGradeScore: number | null = undefined
    studiKasusGradeId: string | null = undefined
    studiKasusGradeScore: number | null = undefined
    nbStudiKasus: number | null = undefined
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
    studiKasusGrade: Grade = undefined
    makalahGrade: Grade = undefined

    nbSeminarMakalah: number | null = undefined
    scoreSeminarMakalah: number | null = undefined

    seminarMakalahScore: number | null = undefined
    constructor(object?: Partial<UkomGrade>) {
        super()
        if (object) this.fromObject(object)
    }
}
type Grade = {
    id: string
    examTypeCode: string
    roomUkomId: string
    participantId: string
    score: string | number | null
    createdBy: string | null
    dateCreated?: string
    idx?: number
}
