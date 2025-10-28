import { Serializable } from '@/modules/base/commons/serializable'

export class ReportModel extends Serializable {
    id: string = undefined
    fileName: string | null = undefined
    fileType: string | null = undefined
    status: string | null = undefined
    reportId: string | null = undefined
    userId: string | null = undefined
    failedReportId: string | null = undefined
    updatedBy: string | null = undefined
    lastUpdated: string | null = undefined
    version: number | null = undefined
    deleteFlag: boolean | null = false
    inactiveFlag: boolean | null = false
    createdBy: string | null = undefined
    dateCreated: string | null = undefined
    idx: number | null = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
