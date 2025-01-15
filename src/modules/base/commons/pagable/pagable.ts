import { PageColumn } from './page-column'
import { PageFilter } from './page-filter'

export class Pagable {
  endpoint: string
  primaryColumnList: PageColumn[] = []
  actionColumnList: PageColumn[] = []
  filterLIst: PageFilter[] = []
  limit: number = 10

  constructor (
    endpoint?: string,
    primaryColumnList?: PageColumn[],
    actionColumnList?: PageColumn[],
    filterLIst?: PageFilter[],
    limit: number = 10
  ) {
    this.endpoint = endpoint
    this.primaryColumnList = primaryColumnList
    this.actionColumnList = actionColumnList
    this.filterLIst = filterLIst
    this.limit = limit
  }
}
