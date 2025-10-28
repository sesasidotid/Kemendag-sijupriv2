import { Serializable } from '../../base/commons/serializable'

export class ReportDownloadModel extends Serializable {
    id: string = undefined
    bucketId: string = undefined

    constructor(object?: { [key: string]: any }) {
        super()
        if (object) this.fromObject(object)
    }
}
