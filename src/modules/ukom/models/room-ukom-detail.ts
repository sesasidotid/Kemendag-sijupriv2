import { Serializable } from '../../base/commons/serializable'

export class RoomUkomDetail extends Serializable {
    id: string = undefined
    name: string = undefined
    participantQuota: number = undefined
    vid_call_link: string = undefined
    vidCallLink: string = undefined
    examStartAt: string = undefined
    examEndAt: string = undefined
    jabatanCode: string = undefined
    jabatanName: string = undefined
    jenjangCode: string = undefined
    jenjangName: string = undefined
    bidangJabatanCode: string = undefined
    bidangJabatanName: string = undefined
    updatedBy: any = undefined
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
