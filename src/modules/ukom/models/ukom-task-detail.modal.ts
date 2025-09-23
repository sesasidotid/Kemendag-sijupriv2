// import { Serializable } from '../../base/commons/serializable'

// export class UkomTaskDetail extends Serializable {
//     id: string = undefined
//     objectId: string = undefined
//     objectName: string = undefined
//     objectGroup: string = undefined
//     comment: string = undefined
//     taskType: string = undefined
//     taskAction: string = undefined
//     taskStatus: string = undefined
//     workflowName: string = undefined
//     workflowTemplate: string = undefined
//     flowName: string = undefined
//     flowId: string = undefined
//     remark: any = undefined
//     instanceId: string = undefined
//     workflowId: string = undefined
//     objectTaskId: string = undefined
//     pendingTaskHistory: PendingTaskHistory[] = []
//     participantUkomId: any = undefined
//     nip: string = undefined
//     nik: any = undefined
//     phone: any = undefined
//     name: any = undefined
//     email: string = undefined
//     tempatLahir: any = undefined
//     tanggalLahir: any = undefined
//     jenisUkom: string = undefined
//     jenisKelaminCode: any = undefined
//     jenisKelaminName: string = undefined
//     rekomendasi: string = undefined
//     rekomendasiUrl: string = undefined
//     rekomendasiFile: string = undefined
//     jabatanCode: any = undefined
//     jabatanName: string = undefined
//     jenjangCode: any = undefined
//     jenjangName: string = undefined
//     tmtJabatan: string = undefined
//     pangkatCode: any = undefined
//     pangkatName: string = undefined
//     tmtPangkat: string = undefined
//     nextJabatanCode: string = undefined
//     nextJabatanName: string = undefined
//     nextJenjangCode: string = undefined
//     nextJenjangName: string = undefined
//     nextPangkatCode: string = undefined
//     nextPangkatName: string = undefined
//     instansiId: any = undefined
//     instansiName: string = undefined
//     unitKerjaId: any = undefined
//     unitKerjaName: string = undefined
//     ukomId: any = undefined
//     dokumenUkomList: DokumenUkomList[] = []
//     documentUkomList: DokumenUkomList[] = []
//     grade: any = undefined
//     jenisInstansi: string = undefined
//     provinsiId: string = undefined
//     kabupatenKotaId: string = undefined
//     noSuratUsulan: string = undefined
//     tglSuratUsulan: string = undefined
//     pendidikanTerakhirCode: string = undefined
//     jurusan: string = undefined
//     predikatKinerja1Id: string = undefined
//     predikatKinerja2Id: string = undefined
//     isMengulang: boolean | string = undefined
//     bidangJabatanCode: string = undefined
//     participantStatus: string = undefined
//     grades: any = undefined
//     userId: string = undefined

//     constructor(object?: { [key: string]: any }) {
//         super()
//         if (object) this.fromObject(object)
//     }
// }

// export interface PendingTaskHistory {
//     id: string
//     objectId: string
//     objectName: any
//     objectGroup: string
//     comment: any
//     taskType: string
//     taskAction?: string
//     taskStatus: string
//     workflowName: string
//     workflowTemplate: string
//     flowName: string
//     flowId: string
//     remark: any
//     instanceId: string
//     workflowId: string
//     objectTaskId: string
//     updatedBy?: string
//     lastUpdated: string
//     version: number
//     deleteFlag: boolean
//     inactiveFlag: boolean
//     createdBy: any
//     dateCreated: string
//     idx: number
// }

// export interface DokumenUkomList {
//     id: any
//     dokumen: string
//     dokumenUrl: string
//     dokumenFile: any
//     dokumenPersyaratanId: string
//     dokumenPersyaratanName: string
//     dokumenStatus: string
//     jenisUkom: any
//     participantUkomId: any
// }

import { Serializable } from '../../base/commons/serializable'

export class UkomTaskDetail extends Serializable {
    id: string | null = null
    objectId: string | null = null
    objectName: string | null = null
    objectGroup: string | null = null
    comment: string | null = null
    taskType: string | null = null
    taskAction: string | null = null
    taskStatus: string | null = null
    workflowName: string | null = null
    workflowTemplate: string | null = null
    flowName: string | null = null
    flowId: string | null = null
    remark: string | null = null
    instanceId: string | null = null
    workflowId: string | null = null
    objectTaskId: string | null = null
    pendingTaskHistory: PendingTaskHistory[] = []

    participantUkomId: string | null = null
    nip: string | null = null
    name: string | null = null
    phone: string | null = null
    email: string | null = null
    tempatLahir: string | null = null
    tanggalLahir: string | null = null
    participantStatus: string | null = null

    jenisInstansi: string | null = null
    provinsiId: string | null = null
    provinsiName: string | null = null
    kabupatenKotaId: string | null = null
    kabupatenKotaName: string | null = null

    unitKerjaId: string | null = null
    unitKerjaName: string | null = null

    noSuratUsulan: string | null = null
    tglSuratUsulan: string | null = null

    pendidikanTerakhirCode: string | null = null
    pendidikanTerakhirName: string | null = null
    jurusan: string | null = null
    predikatKinerja1Id: string | null = null
    predikatKinerja1Name: string | null = null
    predikatKinerja2Id: string | null = null
    predikatKinerja2Name: string | null = null

    jenisUkom: string | null = null
    isMengulang: boolean = false

    jabatanName: string | null = null
    jenjangName: string | null = null
    tmtJabatan: string | null = null

    pangkatCode: string | null = null
    pangkatName: string | null = null
    tmtPangkat: string | null = null

    nextJabatanCode: string | null = null
    nextJabatanName: string | null = null
    nextJenjangCode: string | null = null
    nextJenjangName: string | null = null
    bidangJabatanCode: string | null = null
    bidangJabatanName: string | null = null

    rekomendasi: string | null = null
    rekomendasiUrl: string | null = null
    rekomendasiFile: string | null = null

    dokumenUkomList: DokumenUkomList[] = []

    userId?: string | null = null

    constructor(object?: Partial<UkomTaskDetail>) {
        super()
        if (object) this.fromObject(object)
    }
}

export interface PendingTaskHistory {
    id: string
    objectId: string
    objectName: string
    objectGroup: string
    comment: string | null
    taskType: string
    taskAction?: string | null
    taskStatus: string
    workflowName: string
    workflowTemplate: string
    flowName: string
    flowId: string
    remark: string | null
    instanceId: string
    workflowId: string
    objectTaskId: string
    updatedBy?: string | null
    lastUpdated: string
    version: number
    deleteFlag: boolean
    inactiveFlag: boolean
    createdBy: string | null
    dateCreated: string
    idx: number
}

export interface DokumenUkomList {
    id: string | null
    dokumen: string
    dokumenUrl: string
    dokumenFile: string | null
    dokumenPersyaratanId: string
    dokumenPersyaratanName: string
    dokumenStatus: 'APPROVE' | 'REJECT' | string
    remark?: string | null
}
