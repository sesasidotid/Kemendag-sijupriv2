import { Serializable } from '../../base/commons/serializable'

export class RevisiDokumenUkom extends Serializable {
  id: string = undefined
  taskAction: string = undefined
  object: { [key: string]: any } = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}

export interface Object {
  dokumenUkomList: DokumenUkomList[]
}

export interface DokumenUkomList {
  id: any
  dokumen: string
  dokumenUrl: string
  dokumenFile: any
  dokumenPersyaratanId: string
  dokumenPersyaratanName: string
  dokumenStatus: string
  jenisUkom: any
  participantUkomId: any
}
