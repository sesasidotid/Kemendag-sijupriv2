import { PageColumn } from './page-column'
import { PageFilter } from './page-filter'

export class Pagable {
  endpoint: string
  primaryColumnList: PageColumn[] = []
  actionColumnList: PageColumn[] = []
  filterLIst: PageFilter[] = []
  limit: number = 10
  enablePagination: boolean = true

  constructor (
    endpoint?: string,
    primaryColumnList?: PageColumn[],
    actionColumnList?: PageColumn[],
    filterLIst?: PageFilter[],
    enablePagination: boolean = true,
    limit: number = 10
  ) {
    this.endpoint = endpoint
    this.primaryColumnList = primaryColumnList
    this.actionColumnList = actionColumnList
    this.filterLIst = filterLIst
    this.enablePagination = enablePagination
    this.limit = limit
  }
}
