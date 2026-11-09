import { Serializable } from '@/modules/base/commons/serializable'
import { RoomUkom } from '../cat/room-ukom.model'
import { DokumenUkom } from '../ukom-registration-refactored/document.model'
import { Participant } from '../cat/participant.model'

export class ResignationDocument extends Serializable {
    id: string = undefined
    dokumen: string = undefined
    dokumenUrl: string = undefined
    dokumenFile: any = undefined
    dokumenPersyaratanId: string = undefined
    dokumenPersyaratanName: string = undefined
    dokumenStatus: any = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
