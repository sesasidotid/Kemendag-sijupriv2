import { Serializable } from '../../base/commons/serializable'

export class DokumenPersyaratan extends Serializable {
  id: string = undefined
  name: string = undefined
  association: string = undefined

  //   dokumenPersyaratanId: string = undefined
  //   dokumenPersyaratanName: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
