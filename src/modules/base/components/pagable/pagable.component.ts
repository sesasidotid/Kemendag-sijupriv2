import {
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core'
import { ApiService } from '../../services/api.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Pagable } from '../../commons/pagable/pagable'
import { HttpClient } from '@angular/common/http'
import { Subscription } from 'rxjs'

@Component({
    selector: 'app-pagable',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pagable.component.html',
    styleUrls: ['./pagable.component.scss'],
})
export class PagableComponent implements OnChanges, OnInit, OnDestroy {
    @Input() pagable!: Pagable
    @Input() refresh!: boolean

    page: number = 1
    limit: number = 10
    sortOrder: { [key: string]: 'asc' | 'desc' | '' } = {}
    paginator: any
    onLoad: boolean = false
    enablePagination: boolean = true
    private lastFilterState: { [key: string]: any } = {}
    private queryParamsSubscription: Subscription

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        if (this.pagable.useQueryParams) {
            this.queryParamsSubscription = this.route.queryParams.subscribe(
                (params) => {
                    this.parseQueryParams(params)
                    // Sync lastFilterState after parsing to prevent false filter change detection
                    if (this.pagable.filterList) {
                        this.pagable.filterList.forEach((filter) => {
                            this.lastFilterState[filter.key] = filter.value
                        })
                    }
                    this.loadData()
                },
            )
        }
    }

    ngOnDestroy() {
        if (this.queryParamsSubscription) {
            this.queryParamsSubscription.unsubscribe()
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['pagable']) {
            this.pagable.primaryColumnList.forEach((column) => {
                if (!(column.property in this.sortOrder)) {
                    this.sortOrder[column.property] = ''
                }
            })

            // Sync lastFilterState with current filter values to prevent false filter change detection
            if (this.pagable.filterList) {
                this.pagable.filterList.forEach((filter) => {
                    this.lastFilterState[filter.key] = filter.value
                })
            }

            if (!this.pagable.useQueryParams) {
                this.limit = this.pagable.limit
                this.loadData()
            }
            // For useQueryParams=true, the queryParams subscription handles loading
        }

        if (changes['refresh'] && !changes['refresh'].isFirstChange()) {
            this.loadData()
        }
    }

    isSearchExist() {
        for (const filter of this.pagable.filterList) {
            if (filter.label) {
                return true
            }
        }
        return false
    }

    getPages(): (number | string)[] {
        const totalPages = this.paginator.lastPage
        const currentPage = this.page
        const pages: (number | string)[] = []

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)
            if (currentPage > 4) {
                pages.push('...')
            }
            for (
                let i = Math.max(2, currentPage - 2);
                i <= Math.min(totalPages - 1, currentPage + 2);
                i++
            ) {
                pages.push(i)
            }
            if (currentPage < totalPages - 3) {
                pages.push('...')
            }
            pages.push(totalPages)
        }

        return pages
    }

    fetchData(): void {
        if (this.pagable.useQueryParams) {
            this.updateQueryParams()
        } else {
            this.loadData()
        }
    }

    updateQueryParams() {
        if (this.filtersChanged()) {
            this.page = 1
        }
        const queryParams: any = {
            page: this.page,
            limit: this.limit,
        }

        for (const property in this.sortOrder) {
            if (this.sortOrder[property] !== '') {
                queryParams[`${this.sortOrder[property]}_${property}`] = true
            } else {
                queryParams[`asc_${property}`] = null
                queryParams[`desc_${property}`] = null
            }
        }

        if (this.pagable.filterList) {
            this.pagable.filterList.forEach((filter) => {
                if (filter.value) {
                    queryParams[filter.key] = filter.value
                } else {
                    queryParams[filter.key] = null
                }
            })
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            queryParamsHandling: 'merge',
        })
    }

    parseQueryParams(params: any) {
        if (params['page']) {
            this.page = Number(params['page'])
        } else {
            this.page = 1
        }

        if (params['limit']) {
            this.limit = Number(params['limit'])
        } else {
            this.limit = this.pagable.limit
        }

        // Reset sort order
        for (const property in this.sortOrder) {
            this.sortOrder[property] = ''
        }

        for (const key in params) {
            if (key.startsWith('asc_') && params[key] === 'true') {
                const prop = key.substring(4)
                if (this.sortOrder.hasOwnProperty(prop)) {
                    this.sortOrder[prop] = 'asc'
                }
            } else if (key.startsWith('desc_') && params[key] === 'true') {
                const prop = key.substring(5)
                if (this.sortOrder.hasOwnProperty(prop)) {
                    this.sortOrder[prop] = 'desc'
                }
            }
        }

        if (this.pagable.filterList) {
            this.pagable.filterList.forEach((filter) => {
                if (params[filter.key]) {
                    filter.value = params[filter.key]
                }
                // Keep existing/default value if param is not in URL
            })
        }
    }

    loadData(): void {
        this.onLoad = true

        let query = ''
        const hasExistingQuery = this.pagable.endpoint.includes('?')
        query += `${hasExistingQuery ? '&' : '?'}page=${this.page}&limit=${
            this.limit
        }`

        for (const property in this.sortOrder) {
            if (this.sortOrder[property] !== '') {
                query += `&${this.sortOrder[property]}_${property}=true`
            }
        }

        if (this.pagable.filterList) {
            this.pagable.filterList.forEach((filter) => {
                if (filter.value) {
                    query += `&${filter.key}=${filter.value}`
                }
            })
        }

        // let query = `?page=${this.page}&limit=${this.limit}`

        // for (const property in this.sortOrder) {
        //   if (this.sortOrder[property] !== '') {
        //     query += `&${this.sortOrder[property]}_${property}=true`
        //   }
        // }

        // if (this.pagable.filterLIst) {
        //   this.pagable.filterLIst.forEach(filter => {
        //     if (filter.value) {
        //       query += `&${filter.key}=${filter.value}`
        //     }
        //   })
        // }

        const isLocalEndpoint =
            this.pagable.endpoint.startsWith('http://localhost')

        const fetchUrl = isLocalEndpoint
            ? this.pagable.endpoint
            : `${this.pagable.endpoint}${query}`

        const fetchObservable = isLocalEndpoint
            ? this.http.get(fetchUrl)
            : this.apiService.getData(fetchUrl)

        fetchObservable.subscribe({
            next: (response: any) => {
                // Wrap response in data only if it isn't already wrapped
                this.paginator = response?.data ? response : { data: response }
                this.onLoad = false

                const hasPagination =
                    response &&
                    typeof response === 'object' &&
                    'data' in response &&
                    'lastPage' in response

                if (hasPagination) {
                    this.enablePagination = true
                } else {
                    this.enablePagination = false
                }

                if (this.paginator.data?.roomUkomDto?.examScheduleDtoList) {
                    this.paginator.data =
                        this.paginator.data.roomUkomDto.examScheduleDtoList
                }
            },
            error: (e) => {
                console.error('Error fetching data', e)
            },
        })
    }

    getPropertyValue(object: any, property: string): any {
        return property.split('|').reduce((o, i) => (o ? o[i] : null), object)
    }

    getPropertyUrlValue(
        object: any,
        urlDefinition: { path: string; property?: string },
    ): string {
        if (urlDefinition.property) {
            return `${urlDefinition.path}/${object[urlDefinition.property]}`
        }
        return `${urlDefinition.path}`
    }

    next(): void {
        this.page += 1
        this.fetchData()
    }

    select(page: number | string): void {
        this.page = Number(page)
        this.fetchData()
    }

    prev(): void {
        this.page -= 1
        this.fetchData()
    }

    toggleSort(columnProperty: string): void {
        const column = this.pagable.primaryColumnList.find(
            (col) => col.property === columnProperty,
        )

        // Check if the column is sortable
        if (column && !column.sortable) {
            return
        }

        if (column && column.dynamic) {
            return
        }

        switch (this.sortOrder[columnProperty]) {
            case '':
                this.sortOrder[columnProperty] = 'asc'
                break
            case 'asc':
                this.sortOrder[columnProperty] = 'desc'
                break
            case 'desc':
                this.sortOrder[columnProperty] = ''
                break
        }

        this.fetchData()
    }

    getSortIcon(columnProperty: string): string {
        return this.sortOrder[columnProperty]
    }

    private filtersChanged(): boolean {
        if (!this.pagable.filterList) return false

        let changed = false

        this.pagable.filterList.forEach((filter) => {
            const oldValue = this.lastFilterState[filter.key]
            const newValue = filter.value

            if (oldValue !== newValue) {
                changed = true
            }

            // update last state
            this.lastFilterState[filter.key] = newValue
        })

        return changed
    }
}
