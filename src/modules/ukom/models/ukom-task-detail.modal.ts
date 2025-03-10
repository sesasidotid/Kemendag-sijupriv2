import { Serializable } from '../../base/commons/serializable'

export class UkomTaskDetail extends Serializable {
  id: string = undefined
  objectId: string = undefined
  objectName: any = undefined
  objectGroup: string = undefined
  comment: any = undefined
  taskType: string = undefined
  taskAction: any = undefined
  taskStatus: string = undefined
  workflowName: string = undefined
  workflowTemplate: string = undefined
  flowName: string = undefined
  flowId: string = undefined
  remark: any = undefined
  instanceId: string = undefined
  workflowId: string = undefined
  objectTaskId: string = undefined
  pendingTaskHistory: PendingTaskHistory[] = []
  participantUkomId: any = undefined
  nip: string = undefined
  nik: any = undefined
  phone: any = undefined
  name: any = undefined
  email: string = undefined
  tempatLahir: any = undefined
  tanggalLahir: any = undefined
  jenisUkom: string = undefined
  jenisKelaminCode: any = undefined
  jenisKelaminName: string = undefined
  rekomendasi: any = undefined
  rekomendasiUrl: any = undefined
  rekomendasiFile: any = undefined
  jabatanCode: any = undefined
  jabatanName: string = undefined
  jenjangCode: any = undefined
  jenjangName: string = undefined
  pangkatCode: any = undefined
  pangkatName: string = undefined
  nextJabatanCode: string = undefined
  nextJabatanName: string = undefined
  nextJenjangCode: string = undefined
  nextJenjangName: string = undefined
  nextPangkatCode: string = undefined
  nextPangkatName: string = undefined
  instansiId: any = undefined
  instansiName: string = undefined
  unitKerjaId: any = undefined
  unitKerjaName: string = undefined
  ukomId: any = undefined
  dokumenUkomList: DokumenUkomList[] = []
  documentUkomList: DokumenUkomList[] = []
  grade: any = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
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
