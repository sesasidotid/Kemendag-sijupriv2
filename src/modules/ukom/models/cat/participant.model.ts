import { Serializable } from '@/modules/base/commons/serializable'
import { RoomUkom } from './room-ukom.model'
import { DokumenUkom } from '../ukom-registration-refactored/document.model'

export class Participant extends Serializable {
    id: string = undefined
    name: string = undefined
    email: string = undefined
    phone: string = undefined

    userDetails: any = undefined
    status: string = undefined
    roleCodeList: string[] = undefined

    password: string = undefined
    applicationCode: string = undefined
    channelCodeList: string[] = undefined

    nip: string = undefined
    age: number = undefined

    tempatLahir: string = undefined
    tanggalLahir: string = undefined

    participantStatus: string = undefined
    jenisInstansi: string = undefined

    provinsiId: string = undefined
    provinsiName: string = undefined

    kabupatenKotaId: string = undefined
    kabupatenKotaName: string = undefined

    noSuratUsulan: string = undefined
    tglSuratUsulan: string = undefined

    pendidikanTerakhirCode: string = undefined
    pendidikanTerakhirName: string = undefined
    jurusan: string = undefined

    predikatKinerja1Id: string = undefined
    predikatKinerja1Name: string = undefined
    predikatKinerja2Id: string = undefined
    predikatKinerja2Name: string = undefined

    isMengulang: boolean = undefined
    jenisUkom: string = undefined

    rekomendasi: string = undefined
    rekomendasiUrl: string = undefined
    fileRekomendasi: string = undefined

    pangkatCode: string = undefined
    pangkatName: string = undefined
    tmtPangkat: string = undefined

    jabatanName: string = undefined
    tmtJabatan: string = undefined

    jenjangName: string = undefined

    nextJabatanCode: string = undefined
    nextJabatanName: string = undefined
    nextJenjangCode: string = undefined
    nextJenjangName: string = undefined

    bidangJabatanCode: string = undefined
    bidangJabatanName: string = undefined

    unitKerjaId: string = undefined
    unitKerjaName: string = undefined
    userId: string = undefined
    ukomBanDto: any = undefined
    roomUkomDto: RoomUkom | undefined = undefined

    documentUkomList: DokumenUkom[] = undefined
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
