import { Serializable } from "../../base/commons/serializable";

export class UkomTaskDetail extends Serializable {
    id: string
    objectId: string
    objectName: any
    objectGroup: string
    comment: any
    taskType: string
    taskAction: any
    taskStatus: string
    workflowName: string
    workflowTemplate: string
    flowName: string
    flowId: string
    remark: any
    instanceId: string
    workflowId: string
    objectTaskId: string
    pendingTaskHistory: PendingTaskHistory[]
    participantUkomId: any
    nip: string
    nik: any
    phone: any
    name: any
    email: string
    tempatLahir: any
    tanggalLahir: any
    jenisUkom: string
    jenisKelaminCode: any
    jenisKelaminName: string
    rekomendasi: any
    rekomendasiUrl: any
    rekomendasiFile: any
    jabatanCode: any
    jabatanName: string
    jenjangCode: any
    jenjangName: string
    pangkatCode: any
    pangkatName: string
    nextJabatanCode: string
    nextJabatanName: string
    nextJenjangCode: string
    nextJenjangName: string
    nextPangkatCode: string
    nextPangkatName: string
    instansiId: any
    instansiName: string
    unitKerjaId: any
    unitKerjaName: string
    ukomId: any
    dokumenUkomList: DokumenUkomList[]

    constructor(object?: { [key: string]: any }) {
        super();
        if (object) this.fromObject(object);
    }
}

export interface PendingTaskHistory {
    id: string
    objectId: string
    objectName: any
    objectGroup: string
    comment: any
    taskType: string
    taskAction?: string
    taskStatus: string
    workflowName: string
    workflowTemplate: string
    flowName: string
    flowId: string
    remark: any
    instanceId: string
    workflowId: string
    objectTaskId: string
    updatedBy?: string
    lastUpdated: string
    version: number
    deleteFlag: boolean
    inactiveFlag: boolean
    createdBy: any
    dateCreated: string
    idx: number
  }
  
  export interface DokumenUkomList {
    id: any
    dokumen: string
    dokumenUrl: string
    dokumenFile: any
    dokumenPersyaratanId: string
    dokumenPersyaratanName: string
    dokumenStatus: string
    jenisUkom: any
    participantUkomId: any
  }
  