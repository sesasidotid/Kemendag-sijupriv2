import { Serializable } from '../../../modules/base/commons/serializable'
import { ObjectTask } from './object-task.model'

export class PrevPendingTask extends Serializable {
  id: string = undefined
  name: string = undefined
  email: string = undefined
  phone: string = undefined
  userDetails: any = undefined
  status: any = undefined
  roleCodeList: any[] = undefined
  password: any = undefined
  applicationCode: string = undefined
  channelCodeList: string[] = undefined
  nip: string = undefined
  nik: string = undefined
  tempatLahir: string = undefined
  tanggalLahir: string = undefined
  jenisUkom: string = undefined
  jenisKelaminCode: string = undefined
  jenisKelaminName: string = undefined
  rekomendasi: any = undefined
  rekomendasiUrl: any = undefined
  rekomendasiFile: any = undefined
  jabatanCode: string = undefined
  jabatanName: string = undefined
  jenjangCode: string = undefined
  jenjangName: string = undefined
  pangkatCode: string = undefined
  pangkatName: string = undefined
  nextJabatanCode: string = undefined
  nextJabatanName: string = undefined
  nextJenjangCode: string = undefined
  nextJenjangName: string = undefined
  nextPangkatCode: string = undefined
  nextPangkatName: string = undefined
  bidangJabatanCode: any = undefined
  bidangJabatanName: any = undefined
  instansiId: string = undefined
  instansiName: string = undefined
  unitKerjaId: string = undefined
  unitKerjaName: string = undefined
  userId: string = undefined
  dokumenUkomList: DokumenUkomList[] = [];
  [key: string]: any

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
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
