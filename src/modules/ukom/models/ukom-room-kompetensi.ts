import { Serializable } from '../../base/commons/serializable'

export class UkomRoomKompetensi extends Serializable {
  id: string = undefined
  code: string = undefined
  type: any = undefined
  jabatanCode: string = undefined
  jenjangCode: string = undefined
  bidangJabatanCode: any = undefined
  name: string = undefined
  description: any = undefined
  updatedBy: any = undefined
  lastUpdated: string = undefined
  version: number = undefined
  deleteFlag: boolean = undefined
  inactiveFlag: boolean = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
