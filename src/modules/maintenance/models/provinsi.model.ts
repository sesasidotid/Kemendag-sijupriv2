import { Serializable } from '../../base/commons/serializable'

export class Provinsi extends Serializable {
  id: string = undefined
  latitude: string = undefined
  longitude: string = undefined
  wilayahCode: string = undefined
  wilayah_code: string = undefined
  name: string = undefined
  description: string = undefined
  updatedBy: string = undefined
  lastUpdated: string = undefined
  version: number = undefined
  deleteFlag: boolean = undefined
  inactiveFlag: boolean = undefined
  createdBy: string = undefined
  dateCreated: string = undefined
  idx: number = undefined

  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
