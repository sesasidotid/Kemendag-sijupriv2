import { Serializable } from '../../base/commons/serializable'

export class UserInstansiDetail extends Serializable {
  nip: string = undefined
  jenisKelaminCode: any = undefined
  instansiId: string = undefined
  updatedBy: any = undefined
  lastUpdated: string = undefined
  version: number = undefined
  deleteFlag: boolean = undefined
  inactiveFlag: boolean = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined
  name: string = undefined
  phone: any = undefined
  email: string = undefined
  user: {
    id: string
    name: string
    email: string
    phone: any
    status: string
    userDetails: any
    updatedBy: any
    lastUpdated: string
    version: number
    deleteFlag: boolean
    inactiveFlag: boolean
    createdBy: string
    dateCreated: string
    idx: number
  } = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
