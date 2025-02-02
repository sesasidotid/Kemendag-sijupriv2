import { Serializable } from '../../base/commons/serializable'

export class Task extends Serializable {
  id: string = undefined
  taskAction: string = undefined
  object: TaskObject | any = {}
  //   object: any = undefined
  remark: any = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}

export interface TaskObject {
  waktuPelaksanaan?: string
  fileSuratUndangan?: string
  formasi_dokumen_list?: any[]
  id?: string
  formasiDetailDtoList?: Array<{
    id: string
    formasiResultDtoList: Array<{
      id: string
      result: number
    }>
  }>
}
