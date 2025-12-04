import { Serializable } from '@/modules/base/commons/serializable'

export class PaginationWrapper<T extends Serializable> extends Serializable {
    currentPage: number = 1
    data: T[] = []
    firstPageUrl: string = ''
    lastPage: number = 1
    lastPageUrl: string = ''
    nextPageUrl: string | null = null
    prevPageUrl: string | null = null
    path: string = ''
    perPage: number = 0
    from: number = 0
    to: number = 0
    total: number = 0
    links: Array<{
        url: string | null
        label: string
        active: boolean
    }> = []

    constructor(
        object?: { [key: string]: any },
        itemClass?: new (obj?: any) => T,
    ) {
        super()
        if (object) this.fromObject(object, itemClass)
    }

    override fromObject(
        object: { [key: string]: any },
        itemClass?: new (obj?: any) => T,
    ) {
        this.currentPage = object['currentPage']
        this.firstPageUrl = object['firstPageUrl']
        this.lastPage = object['lastPage']
        this.lastPageUrl = object['lastPageUrl']
        this.nextPageUrl = object['nextPageUrl']
        this.prevPageUrl = object['prevPageUrl']
        this.path = object['path']
        this.perPage = object['perPage']
        this.from = object['from']
        this.to = object['to']
        this.total = object['total']
        this.links = object['links'] || []

        if (object['data'] && itemClass) {
            this.data = object['data'].map((item: any) => new itemClass(item))
        } else if (object['data']) {
            this.data = object['data']
        }
    }
}
