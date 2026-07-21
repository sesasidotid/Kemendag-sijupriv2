import { PageColumn } from './page-column'
import { PageFilter } from './page-filter'

export class Pagable {
    endpoint: string
    primaryColumnList: PageColumn[] = []
    actionColumnList: PageColumn[] = []
    filterList: PageFilter[] = []
    exclusionList: { label: string; value: string | number | boolean }[] = []
    limit: number = 10
    enablePagination: boolean = true
    useQueryParams: boolean = false

    constructor(
        endpoint?: string,
        primaryColumnList?: PageColumn[],
        actionColumnList?: PageColumn[],
        filterList?: PageFilter[],
        exclusionList?: { label: string; value: string | number | boolean }[],
        enablePagination: boolean = true,
        limit: number = 10,
        useQueryParams: boolean = false,
    ) {
        this.endpoint = endpoint
        this.primaryColumnList = primaryColumnList
        this.actionColumnList = actionColumnList
        this.filterList = filterList
        this.exclusionList = exclusionList
        this.enablePagination = enablePagination
        this.limit = limit
        this.useQueryParams = useQueryParams
    }
}
