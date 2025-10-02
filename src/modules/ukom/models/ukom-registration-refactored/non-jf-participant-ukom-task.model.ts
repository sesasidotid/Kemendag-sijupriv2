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
    jenisInstansi: string = undefined
    provinsiId: string | number = undefined
    kabupatenKotaId: string | number = undefined
    unitKerjaName: string = undefined
    jabatanName: string = undefined
    jenjangName: string = undefined
    pangkatCode: string = undefined

    // Ukom Info
    jenisUkom: string = undefined
    nextJabatanCode: string = undefined
    nextJenjangCode: string = undefined
    bidangJabatanCode: string = undefined

    // Surat Usulan
    noSuratUsulan: string = undefined
    tglSuratUsulan: string = undefined

    // Pendidikan
    pendidikanTerakhirCode: string = undefined
    jurusan: string = undefined

    // Predikat Kinerja
    predikatKinerja1Id: string | number = undefined
    predikatKinerja2Id: string | number = undefined

    // Extra
    isMengulang: boolean = undefined
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
