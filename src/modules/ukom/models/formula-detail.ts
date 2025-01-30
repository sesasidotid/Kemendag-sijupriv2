import { Serializable } from '../../base/commons/serializable'

export class FormulaDetail extends Serializable {
  [key: string]: any

  id: string = undefined
  jabatanCode: string = undefined
  jenjangCode: string = undefined
  catPercentage: string = undefined
  wawancaraPercentage: string = undefined
  seminarPercentage: string = undefined
  praktikPercentage: string = undefined
  portofolioPercentage: string = undefined
  uktPercentage: string = undefined
  ukmskPercentage: string = undefined
  gradeThreshold: string = undefined
  uktThreshold: string = undefined
  jpmThreshold: string = undefined
  createdBy: any = undefined
  dateCreated: string = undefined
  idx: number = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
