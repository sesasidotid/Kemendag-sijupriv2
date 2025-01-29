import { Serializable } from '../../base/commons/serializable'

export class UserInstansi extends Serializable {
  nip: string = undefined
  jenisKelaminCode: string = undefined
  instansiId: string = undefined
  name: string = undefined
  email: string = undefined
  password: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
