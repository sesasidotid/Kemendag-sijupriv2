import { Serializable } from '../../base/commons/serializable'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

export class ExaminerUkom extends Serializable {
    id: string = undefined
    jenisKelaminCode: string = undefined
    updatedBy: any = undefined
    lastUpdated: string = undefined
    version: number = undefined
    deleteFlag: boolean = undefined
    inactiveFlag: boolean = undefined
    createdBy: string = undefined
    dateCreated: string = undefined
    idx: number = undefined
    userId: string = undefined
    nip: string = undefined
    password: string | undefined = undefined
    name: string | undefined = undefined
    user: ExaminerUkomUser | undefined = undefined
    examTypeList: ExamTypeCategory[] = []

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}

export class ExaminerUkomUser extends Serializable {
    id: string = undefined
    name: string = undefined
    email: string = undefined
    phone: string = undefined
    userDetails: unknown = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
