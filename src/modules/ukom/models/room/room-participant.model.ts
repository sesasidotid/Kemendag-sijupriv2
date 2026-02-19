import { Serializable } from '@/modules/base/commons/serializable'
import { Participant } from '@/modules/ukom/models/cat/participant.model'

export class RoomParticipant extends Serializable {
    id: string | null | undefined = undefined
    participantId: string | null | undefined = undefined
    roomId: string | null | undefined = undefined
    participantUkom: Participant | null | undefined = undefined

    constructor(body?: Partial<RoomParticipant>) {
        super()
        if (body) {
            this.fromObject(body)
        }
    }
}
