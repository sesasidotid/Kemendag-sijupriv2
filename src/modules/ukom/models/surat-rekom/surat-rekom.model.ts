import {Serializable} from '@/modules/base/commons/serializable'

export enum SuratRekomStatus  {
    FINISHED = 'FINISHED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
}
export class SuratRekomModel extends Serializable {
    id: string = undefined
    type: string = undefined
    status: SuratRekomStatus = undefined
    fileName: string = undefined

    constructor(object: any) {
        super()
        this.fromObject(object)
    }
}
