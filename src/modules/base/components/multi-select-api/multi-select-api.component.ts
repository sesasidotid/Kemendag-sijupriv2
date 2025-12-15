import { CommonModule } from '@angular/common'
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core'
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms'
import { ChevronDown, LucideAngularModule, Search, X } from 'lucide-angular'
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    Observable,
    Subject,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'

export interface MultiSelectApiOption {
    id: string | number
    label: string
    [key: string]: any
}

export interface MultiSelectApiParams {
    page: number
    limit: number
    [key: string]: any // Allow dynamic search param names
}

@Component({
    selector: 'app-multi-select-api',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule],
    templateUrl: './multi-select-api.component.html',
    styleUrl: './multi-select-api.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectApiComponent),
            multi: true,
        },
    ],
})
export class MultiSelectApiComponent
    implements ControlValueAccessor, OnInit, OnChanges, OnDestroy
{
    @Input() fetchFunction!: (
        params: MultiSelectApiParams,
    ) => Observable<PaginationWrapper<any> | any[]>
    @Input() placeholder: string = 'Select options...'
    @Input() disabled: boolean = false
    @Input() maxHeight: string = '250px'
    @Input() searchPlaceholder: string = 'Search...'
    @Input() emptyMessage: string = 'No options available'
    @Input() noResultsMessage: string = 'No results found'
    @Input() debounceTime: number = 300
    @Input() pageSize: number = 20
    @Input() searchParamName: string = 'search'
    @Input() initialSelectedOptions: MultiSelectApiOption[] = []

    @Output() selectionChange = new EventEmitter<(string | number)[]>()

    @ViewChild('optionsList', { read: ElementRef })
    optionsListRef!: ElementRef

    @ViewChild('selectInput', { read: ElementRef })
    selectInputRef!: ElementRef

    selectedIds: (string | number)[] = []
    selectedOptionsCache: Map<string | number, MultiSelectApiOption> = new Map()
    searchTerm: string = ''
    isDropdownOpen: boolean = false
    options: MultiSelectApiOption[] = []

    dropdownPosition = { top: '0px', left: '0px', width: '0px' }

    // Pagination state
    currentPage: number = 0
    totalPages: number = 0
    isLoading: boolean = false
    hasMoreData: boolean = true

    readonly X = X
    readonly ChevronDown = ChevronDown
    readonly Search = Search

    private searchSubject$ = new BehaviorSubject<string>('')
    private destroy$ = new Subject<void>()
    private onChange: (value: (string | number)[]) => void = () => {}
    private onTouched: () => void = () => {}

    constructor(private elementRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            if (this.isDropdownOpen) {
                this.closeDropdown()
            }
        }
    }

    @HostListener('window:scroll', ['$event'])
    @HostListener('window:resize', ['$event'])
    onWindowScrollOrResize(): void {
        if (this.isDropdownOpen) {
            this.updateDropdownPosition()
        }
    }

    ngOnInit(): void {
        this.setupSearchListener()
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialSelectedOptions'] && this.initialSelectedOptions) {
            // Cache the initial selected options so they can be displayed with labels
            this.initialSelectedOptions.forEach((option) => {
                this.selectedOptionsCache.set(option.id, option)
            })
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    private setupSearchListener(): void {
        this.searchSubject$
            .pipe(
                debounceTime(this.debounceTime),
                distinctUntilChanged(),
                tap(() => {
                    this.resetPagination()
                }),
                switchMap((searchTerm) => {
                    const params: MultiSelectApiParams = {
                        page: this.currentPage + 1,
                        limit: this.pageSize,
                    }
                    params[this.searchParamName] = searchTerm
                    return this.fetchData(params)
                }),
                takeUntil(this.destroy$),
            )
            .subscribe()
    }

    private resetPagination(): void {
        this.currentPage = 0
        this.options = []
        this.hasMoreData = true
        this.totalPages = 0
    }

    private fetchData(
        params: MultiSelectApiParams,
    ): Observable<PaginationWrapper<any> | any[]> {
        if (!this.fetchFunction) {
            throw new Error('fetchFunction is required')
        }

        this.isLoading = true
        return this.fetchFunction(params).pipe(
            tap((response) => {
                let newData: MultiSelectApiOption[] = []

                // Handle PaginationWrapper response (check for data property)
                if (
                    response &&
                    typeof response === 'object' &&
                    'data' in response &&
                    'currentPage' in response
                ) {
                    const wrapper = response as any
                    newData = wrapper.data || []
                    this.totalPages = wrapper.lastPage || 1
                    this.currentPage = wrapper.currentPage || params.page
                    this.hasMoreData = this.currentPage < this.totalPages
                }
                // Handle direct array response
                else if (Array.isArray(response)) {
                    newData = response
                    // For direct array, assume more data if we got full page
                    this.hasMoreData = response.length >= this.pageSize
                    this.currentPage = params.page
                }

                if (params.page === 1) {
                    this.options = newData
                } else {
                    this.options = [...this.options, ...newData]
                }

                this.isLoading = false
            }),
            takeUntil(this.destroy$),
        )
    }

    writeValue(value: (string | number)[]): void {
        if (value) {
            this.selectedIds = value
        } else {
            this.selectedIds = []
        }
    }

    registerOnChange(fn: (value: (string | number)[]) => void): void {
        this.onChange = fn
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled
    }

    toggleDropdown(): void {
        if (!this.disabled) {
            if (this.isDropdownOpen) {
                this.closeDropdown()
            } else {
                this.openDropdown()
            }
        }
    }

    private openDropdown(): void {
        this.isDropdownOpen = true
        this.updateDropdownPosition()
        if (this.options.length === 0) {
            this.searchSubject$.next(this.searchTerm)
        }
    }

    private closeDropdown(): void {
        this.isDropdownOpen = false
        this.searchTerm = ''
    }

    private updateDropdownPosition(): void {
        if (this.selectInputRef && this.selectInputRef.nativeElement) {
            const rect =
                this.selectInputRef.nativeElement.getBoundingClientRect()
            this.dropdownPosition = {
                top: `${rect.bottom + 4}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
            }
        }
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement
        this.searchTerm = input.value
        this.searchSubject$.next(this.searchTerm)
    }

    onScroll(event: Event): void {
        const element = event.target as HTMLElement
        const threshold = 50
        const position =
            element.scrollHeight - element.scrollTop - element.clientHeight

        if (
            position < threshold &&
            !this.isLoading &&
            this.hasMoreData &&
            this.isDropdownOpen
        ) {
            this.loadMore()
        }
    }

    loadMore(): void {
        if (!this.isLoading && this.hasMoreData) {
            const params: MultiSelectApiParams = {
                page: this.currentPage + 1,
                limit: this.pageSize,
            }
            params[this.searchParamName] = this.searchTerm
            this.fetchData(params).subscribe()
        }
    }

    toggleOption(option: MultiSelectApiOption): void {
        const index = this.selectedIds.indexOf(option.id)
        if (index > -1) {
            this.selectedIds = this.selectedIds.filter((id) => id !== option.id)
            this.selectedOptionsCache.delete(option.id)
        } else {
            this.selectedIds = [...this.selectedIds, option.id]
            this.selectedOptionsCache.set(option.id, option)
        }
        this.emitChanges()
    }

    isSelected(optionId: string | number): boolean {
        return this.selectedIds.includes(optionId)
    }

    removeOption(optionId: string | number, event?: Event): void {
        if (event) {
            event.stopPropagation()
        }
        this.selectedIds = this.selectedIds.filter((id) => id !== optionId)
        this.selectedOptionsCache.delete(optionId)
        this.emitChanges()
    }

    clearAll(event: Event): void {
        event.stopPropagation()
        this.selectedIds = []
        this.selectedOptionsCache.clear()
        this.emitChanges()
    }

    getSelectedOptions(): MultiSelectApiOption[] {
        return this.selectedIds.map((id) => {
            console.log('qq', this.selectedOptionsCache)
            const cached = this.selectedOptionsCache.get(id)
            if (cached) {
                return cached
            }
            // Fallback: create option with ID as label if not cached yet
            // This prevents showing empty badges during initialization
            return { id, label: String(id) }
        })
    }

    private emitChanges(): void {
        this.onChange(this.selectedIds)
        this.onTouched()
        this.selectionChange.emit(this.selectedIds)
    }
}
