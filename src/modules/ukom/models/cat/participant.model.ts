import { Serializable } from '@/modules/base/commons/serializable'
import { RoomUkom } from './room-ukom.model'
import { DokumenUkom } from '../ukom-registration-refactored/document.model'

export class Participant extends Serializable {
    id: string | null | undefined = undefined
    name: string | null | undefined = undefined
    email: string | null | undefined = undefined
    phone: string | null | undefined = undefined

    userDetails: any | null | undefined = undefined
    status: string | null | undefined = undefined
    roleCodeList: string[] | null | undefined = undefined

    password: string | null | undefined = undefined
    applicationCode: string | null | undefined = undefined
    channelCodeList: string[] | null | undefined = undefined

    nip: string | null | undefined = undefined
    age: number | null | undefined = undefined

    tempatLahir: string | null | undefined = undefined
    tanggalLahir: string | null | undefined = undefined

    participantStatus: string | null | undefined = undefined
    jenisInstansi: string | null | undefined = undefined

    provinsiId: string | null | undefined = undefined
    provinsiName: string | null | undefined = undefined

    kabupatenKotaId: string | null | undefined = undefined
    kabupatenKotaName: string | null | undefined = undefined

    noSuratUsulan: string | null | undefined = undefined
    tglSuratUsulan: string | null | undefined = undefined

    pendidikanTerakhirCode: string | null | undefined = undefined
    pendidikanTerakhirName: string | null | undefined = undefined
    jurusan: string | null | undefined = undefined

    predikatKinerja1Id: string | null | undefined = undefined
    predikatKinerja1Name: string | null | undefined = undefined
    predikatKinerja2Id: string | null | undefined = undefined
    predikatKinerja2Name: string | null | undefined = undefined

    isMengulang: boolean | null | undefined = undefined
    jenisUkom: string | null | undefined = undefined

    rekomendasi: string | null | undefined = undefined
    rekomendasiUrl: string | null | undefined = undefined
    fileRekomendasi: string | null | undefined = undefined

    pangkatCode: string | null | undefined = undefined
    pangkatName: string | null | undefined = undefined
    tmtPangkat: string | null | undefined = undefined

    jabatanName: string | null | undefined = undefined
    tmtJabatan: string | null | undefined = undefined

    jenjangName: string | null | undefined = undefined

    nextJabatanCode: string | null | undefined = undefined
    nextJabatanName: string | null | undefined = undefined
    nextJenjangCode: string | null | undefined = undefined
    nextJenjangName: string | null | undefined = undefined

    bidangJabatanCode: string | null | undefined = undefined
    bidangJabatanName: string | null | undefined = undefined

    unitKerjaId: string | null | undefined = undefined
    unitKerjaName: string | null | undefined = undefined
    userId: string | null | undefined = undefined

    ukomBanDto: any | null | undefined = undefined
    roomUkomDto: RoomUkom | null | undefined = undefined

    documentUkomList: DokumenUkom[] | null | undefined = undefined

    constructor(object?: { [key: string]: any }) {
        super()

        if (object) {
            this.fromObject(object)

            if (object['roomUkomDto']) {
                this.roomUkomDto = new RoomUkom(object['roomUkomDto'])
            }
        }
    }
}
