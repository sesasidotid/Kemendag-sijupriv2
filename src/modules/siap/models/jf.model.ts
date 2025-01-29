import { Serializable } from '../../base/commons/serializable'

export class JF extends Serializable {
  nip: string = undefined
  name: string = undefined
  nik: string = undefined
  email: string = undefined
  tempatLahir: string = undefined
  tanggalLahir: Date = undefined
  ktp?: string = undefined
  ktpUrl?: string = undefined
  jenisKelaminCode: string = undefined
  jenisKelaminName: string = undefined
  unitKerjaId: string = undefined
  password?: string = undefined

  phone: string = undefined
  fileKtp?: string = undefined

  pangkatCode: string = undefined
  pangkatName: string = undefined

  jabatanCode: string = undefined
  jabatanName: string = undefined

  jenjangCode: string = undefined
  jenjangName: string = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
