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
    tanggalLahir: Date | string = undefined
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

    unitKerjaName: string = undefined
    JabatanName: string = undefined
    JenjangName: string = undefined
    jenisUkom: string = undefined

    pendidikanTerakhirCode: string = undefined
    jurusan: string = undefined
    tglSuratUsulan: Date | string = undefined
    no_surat_usulan: string = undefined
    noSuratUsulan: string = undefined
    predikat_kinerja_1_id: string = undefined
    predikat_kinerja_2_id: string = undefined
    predikatKinerja1Id: string = undefined
    predikatKinerja2Id: string = undefined
    jenisInstansi: string = undefined
    jenisInstasiName: string = undefined
    isMengulang: boolean | string = undefined
    age: string = undefined

    jenis_instansi: string = undefined
    provinsi_id: string = undefined
    kabupaten_kota_id: string = undefined
    bidang_jabatan_code: string = undefined

    participantStatus: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
