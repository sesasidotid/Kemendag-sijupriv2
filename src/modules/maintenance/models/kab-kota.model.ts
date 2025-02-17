import { Serializable } from '../../base/commons/serializable'

export class KabKota extends Serializable {
  id: string = undefined
  name: string = undefined
  provinsiId: string = undefined
  type: string = undefined
  latitude: string = undefined
  longitude: string = undefined
  provinsi_id: string = undefined
  constructor (object?: { [key: string]: any }) {
    super()
    if (object) this.fromObject(object)
  }
}
