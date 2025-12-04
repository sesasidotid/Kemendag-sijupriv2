import { Serializable } from '../../base/commons/serializable'

export class RoomUkomDetail extends Serializable {
    id: string = undefined
    name: string = undefined
    jabatanCode: string = undefined
    jabatanName: string = undefined
    jenjangCode: string = undefined
    jenjangName: string = undefined
    bidangJabatanCode: string | null = undefined
    bidangJabatanName: string | null = undefined
    participantQuota: number = undefined
    examStartAt: string = undefined
    examEndAt: string = undefined
    vidCallLink: string = undefined
    participantDtoList: unknown = undefined
    examScheduleDtoList: unknown = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
