import { Serializable } from '@/modules/base/commons/serializable'

export class UkomRegistrationRequirement extends Serializable {
    id: string = undefined
    jenjangCode: string = undefined
    jenisUkom: string = undefined
    angkaKreditThreshold: number = undefined
    lastNYear: number = undefined
    ratingHasilId: string = undefined
    ratingKinerjaId: string = undefined
    predikatKinerjaId: string = undefined
    updatedBy: string | null = undefined
    lastUpdated: string = undefined
    version: number = undefined
    deleteFlag: boolean = undefined
    inactiveFlag: boolean = undefined
    createdBy: string | null = undefined
    dateCreated: string = undefined
    idx: number = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
