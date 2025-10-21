import { Serializable } from '../../base/commons/serializable'

export class PesertaUkom extends Serializable {
    id: string = undefined
    nip: string = undefined
    nik: string = undefined
    name: string = undefined
    email: string = undefined
    phone: string = undefined
    tempatLahir: string = undefined
    tanggalLahir: Date | string = undefined
    jenisKelaminCode: string = undefined
    jenisKelaminName: string = undefined
    password: string = undefined

    jabatanCode: string = undefined
    jabatanName: string = undefined
    tmtJabatan: string = undefined
    nextJabatanCode: string = undefined
    nextJabatanName: string = undefined

    jenjangCode: string = undefined
    jenjangName: string = undefined
    nextJenjangCode: string = undefined
    nextJenjangName: string = undefined

    pangkatCode: string = undefined
    pangkatName: string = undefined
    tmtPangkat: string = undefined
    nextPangkatCode: string = undefined
    nextPangkatName: string = undefined

    instansiId: string = undefined
    unitKerjaId: string = undefined

    dokumenUkomList: any[] = undefined
    pendingTaskHistory: any[] = undefined

    unitKerjaName: string = undefined
    JabatanName: string = undefined
    JenjangName: string = undefined
    jenisUkom: string = undefined

    pendidikanTerakhirCode: string = undefined
    jurusan: string = undefined
    tglSuratUsulan: Date | string = undefined
    noSuratUsulan: string = undefined
    predikatKinerja1Id: string = undefined
    predikatKinerja2Id: string = undefined
    jenisInstansi: string = undefined
    jenisInstasiName: string = undefined
    isMengulang: boolean | string = undefined
    age: string = undefined

    provinsiId: string = undefined
    kabupatenKotaId: string = undefined
    bidangJabatanCode: string = undefined

    participantStatus: string = undefined
    dateCreated: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
