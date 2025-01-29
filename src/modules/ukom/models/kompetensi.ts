import { Serializable } from '../../base/commons/serializable'

export class KompetensiUkom extends Serializable {
  code: string = undefined
  name: string = undefined
  jabatan_code: string = undefined
  jenjang_code: string = undefined
  bidang_jabatan_code: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
