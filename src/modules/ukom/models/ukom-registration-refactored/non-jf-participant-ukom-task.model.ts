import { Serializable } from '@/modules/base/commons/serializable'

export class DokumenUkom extends Serializable {
    dokumenFile: string = undefined
    dokumenPersyaratanName: string = undefined
    dokumenPersyaratanId: string | number = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

export class NonJFParticipantUkomTask extends Serializable {
    // Basic Info
    name: string = undefined
    nip: string = undefined
    tanggalLahir: string = undefined // could be Date if backend expects it
    phone: string = undefined
    email: string = undefined
    password: string = undefined

    // Instansi & Lokasi
    jenis_instansi: string = undefined
    provinsi_id: string | number = undefined
    kabupaten_kota_id: string | number = undefined
    unitKerjaName: string = undefined
    jabatanName: string = undefined
    jenjangName: string = '-'
    pangkatCode: string = undefined

    // Ukom Info
    jenis_ukom: string = undefined
    nextJabatanCode: string = undefined
    nextJenjangCode: string = undefined
    bidang_jabatan_code: string = undefined

    // Surat Usulan
    no_surat_usulan: string = undefined
    tglSuratUsulan: string = undefined

    // Pendidikan
    pendidikanTerakhirCode: string = undefined
    jurusan: string = undefined

    // Predikat Kinerja
    predikat_kinerja_1_id: string | number = undefined
    predikat_kinerja_2_id: string | number = undefined

    // Extra
    isMengulang: boolean = false
    dokumenUkomList: DokumenUkom[] = []

    //pajangan, menunggu backend
    tempatLahir: string = undefined
    tmtJabatan: string = undefined
    tmtPangkat: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
