import { Serializable } from '../../base/commons/serializable'

export class FormasiDokumenRequirement extends Serializable {
  id: any = undefined
  dokumen: any = undefined
  dokumenUrl: any = undefined
  dokumenFile: any = undefined
  dokumenPersyaratanId: string = undefined
  dokumenPersyaratanName: string = undefined
  dokumenStatus: any = undefined
  formasiId: any = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
