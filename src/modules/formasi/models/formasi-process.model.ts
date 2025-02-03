import { Serializable } from '../../base/commons/serializable'

export class ProcessFormasi extends Serializable {
  id: string = undefined
  waktuPelaksanaan: string = undefined
  suratUndangan: string = undefined
  suratUndanganUrl: string = undefined
  fileSuratUndangan: any = undefined
  formasiId: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
