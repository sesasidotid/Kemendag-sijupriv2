import { Serializable } from '../../base/commons/serializable'

export class PesertaUkom extends Serializable {
  id: string = undefined
  jenis_ukom: string = undefined
  nip: string = undefined
  nik: string = undefined
  name: string = undefined
  email: string = undefined
  phone: string = undefined
  tempatLahir: string = undefined
  tanggalLahir: Date = undefined
  jenisKelaminCode: string = undefined
  jenisKelaminName: string = undefined
  password: string = undefined

  jabatanCode: string = undefined
  jabatanName: string = undefined
  nextJabatanCode: string = undefined
  nextJabatanName: string = undefined

  jenjangCode: string = undefined
  jenjangName: string = undefined
  nextJenjangCode: string = undefined
  nextJenjangName: string = undefined

  pangkatCode: string = undefined
  pangkatName: string = undefined
  nextPangkatCode: string = undefined
  nextPangkatName: string = undefined

  instansi_id: string = undefined
  unit_kerja_id: string = undefined

  dokumenUkomList: any[] = undefined
  pendingTaskHistory: any[] = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
