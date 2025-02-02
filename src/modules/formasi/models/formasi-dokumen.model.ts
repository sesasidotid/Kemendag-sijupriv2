import { Serializable } from '../../base/commons/serializable'

export class FormasiDokumen extends Serializable {
  //   id: string = undefined
  status?: 'PENDING' | 'APPROVE' | 'REJECT'
  dokumenName?: string = undefined
  //   dokumenFile: string = undefined
  file?: string = undefined
  file_url?: string

  id?: any = undefined
  dokumen?: string = undefined
  dokumenUrl?: string = undefined
  dokumenFile?: any = undefined
  dokumenPersyaratanId?: string = undefined
  dokumenPersyaratanName?: string = undefined
  dokumenStatus?: 'PENDING' | 'APPROVE' | 'REJECT' = undefined
  formasiId?: any = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
