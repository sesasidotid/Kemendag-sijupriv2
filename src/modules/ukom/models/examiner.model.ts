import { Serializable } from '../../base/commons/serializable'

export class ExaminerUkom extends Serializable {
  id: string = undefined
  jenisKelaminCode: string = undefined
  jenis_kelamin_code: string = undefined
  updatedBy: any = undefined
  lastUpdated: string = undefined
  version: number = undefined
  deleteFlag: boolean = undefined
  inactiveFlag: boolean = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined
  userId: string = undefined
  nip: string = undefined
  password: string = undefined
  name: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
