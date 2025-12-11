import { Serializable } from '../../base/commons/serializable'
import { DokumenUkom } from './ukom-registration-refactored/document.model'
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

    documentUkomList: DokumenUkom[] = []

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
