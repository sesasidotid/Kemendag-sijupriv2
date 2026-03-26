import { Serializable } from '../../base/commons/serializable'

export class FormulaDetail extends Serializable {
    id: string = undefined
    jabatanCode: string = undefined
    jabatanName: string = undefined
    jenjangCode: string = undefined
    jenjangName: string = undefined
    catPercentage: number = undefined
    wawancaraPercentage: number = undefined
    seminarPercentage: number = undefined
    praktikPercentage: number = undefined
    portofolioPercentage: number = undefined
    studiKasusPercentage: number = undefined
    uktPercentage: number = undefined
    ukmskPercentage: number = undefined
    gradeThreshold: number = undefined
    uktThreshold: number = undefined
    jpmThreshold: number = undefined

    constructor(object?: Partial<FormulaDetail>) {
        super()
        if (object) this.fromObject(object)
    }
}
