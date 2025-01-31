import { Serializable } from '../../base/commons/serializable'

export class DataDokumenUkom extends Serializable {
  dokumenPersyaratanName: string = undefined
  jenisUkom: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
