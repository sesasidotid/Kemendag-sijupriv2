import { Serializable } from '@/modules/base/commons/serializable'

export class ParticipantHistoryTask extends Serializable {
    id: string = undefined
    nik: string | null = undefined
    phone: number | null = undefined
    name: string = undefined
    email: string = undefined
    tempatLahir: string = undefined
    tanggalLahir: Date | string = undefined
    jenisUkom: string = undefined
    rekomendasi: string | null = undefined
    jenisKelaminCode: string | null = undefined
    jabatanCode: string | null = undefined
    jenjangCode: string | null = undefined
    pangkatCode: string | null = undefined
    nextJabatanCode: string | null = undefined
    nextJenjangCode: string | null = undefined
    instansiId: string | null = undefined
    unitKerjaId: string | null = undefined
    nip: string = undefined
    updatedBy: string | null = undefined
    lastUpdated: string | null = undefined
    userId: string = undefined
    bidangJabatanCode: string | null = undefined
    unitKerjaName: string | null = undefined
    participantStatus: 'non-jf' | 'jf' | null = undefined
    jabatanName: string | null = undefined
    jenjangName: string | null = undefined
    noSuratUsulan: string | null = undefined
    tglSuratUsulan: string | null = undefined
    pendidikanTerakhirCode: string | null = undefined
    jurusan: string | null = undefined
    predikatKinerja1Id: string | null = undefined
    predikatKinerja2Id: string | null = undefined
    isMengulang: boolean = undefined
    jenisInstansi: string | null = undefined
    provinsiId: string | null = undefined
    kabupatenKotaId: string | null = undefined
    tmtPangkat: string | null = undefined
    tmtJabatan: string | null = undefined

    user?: any = undefined
    ukomBan?: any = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
