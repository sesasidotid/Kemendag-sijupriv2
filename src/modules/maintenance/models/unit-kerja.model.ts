import { Serializable } from '../../base/commons/serializable'

export class UnitKerja extends Serializable {
  id: string = undefined
  name: string = undefined
  email: string = undefined
  phone: string = undefined
  alamat: string = undefined
  file_rekomendasi_formasi: string = undefined
  latitude: number = undefined
  longitude: number = undefined
  instansiId: string = undefined
  wilayahCode: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
