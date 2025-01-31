import { Serializable } from '../../base/commons/serializable'

export class DokumenUkomPersyaratan extends Serializable {
  dokumenPersyaratanId: string = undefined
  dokumenPersyaratanName: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
