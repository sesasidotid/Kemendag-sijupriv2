import { Serializable } from '../../base/commons/serializable'

export class AKPTaskDetail extends Serializable {
  id: string = undefined
  objectId: string = undefined
  objectName: string = undefined
  objectGroup: string = undefined
  comment: string = undefined
  taskType: string = undefined
  taskAction: string = undefined
  taskStatus: string = undefined
  workflowName: string = undefined
  workflowTemplate: string = undefined
  flowName: string = undefined
  flowId: string = undefined
  remark: string = undefined
  instanceId: string = undefined
  workflowId: string = undefined
  objectTaskId: string = undefined
  pendingTaskHistory: any[] = undefined
  nip: string = undefined
  name: string = undefined
  tempatLahir: string = undefined
  tanggalLahir: string = undefined
  jenisKelaminCode: string = undefined
  jenisKelaminName: string = undefined
  unitKerjaId: string = undefined
  unitKerjaName: string = undefined
  instansiId: string = undefined
  instansiName: string = undefined
  pangkatCode: string = undefined
  pangkatName: string = undefined
  jabatanCode: string = undefined
  jabatanName: string = undefined
  jenjangCode: string = undefined
  jenjangName: string = undefined
  akpId: string = undefined
  instrumentId: number = undefined
  instrumentName: string = undefined
  namaAtasan: string = undefined
  emailAtasan: string = undefined
  action: string = undefined
  rekomendasi: string = undefined
  rekomendasiUrl: string = undefined
  rekomendasiFile: any = undefined
  matrix1DtoList: any[] = undefined
  matrix2DtoList: any[] = undefined
  matrix3DtoList: any[] = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
