import { CommonModule } from '@angular/common'
import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core'
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR,
} from '@angular/forms'
import { ChevronDown, LucideAngularModule, Search, X } from 'lucide-angular'

export interface MultiSelectOption {
    id: string | number
    label: string
    [key: string]: any
}

@Component({
    selector: 'app-multi-select',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule],
    templateUrl: './multi-select.component.html',
    styleUrl: './multi-select.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectComponent),
            multi: true,
        },
    ],
})
export class MultiSelectComponent
    implements ControlValueAccessor, OnInit, OnChanges
{
    @Input() options: MultiSelectOption[] = []
    @Input() placeholder: string = 'Select options...'
    @Input() disabled: boolean = false
    @Input() maxHeight: string = '250px'
    @Input() searchPlaceholder: string = 'Search...'
    @Input() emptyMessage: string = 'No options available'
    @Input() noResultsMessage: string = 'No results found'

    @Output() selectionChange = new EventEmitter<(string | number)[]>()

    selectedIds: (string | number)[] = []
    searchTerm: string = ''
    isDropdownOpen: boolean = false
    filteredOptions: MultiSelectOption[] = []
    dropdownStyle: { [key: string]: string } = {}

    readonly X = X
    readonly ChevronDown = ChevronDown
    readonly Search = Search

    constructor(private elementRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        const clickedInside = this.elementRef.nativeElement.contains(
            event.target,
        )
        if (!clickedInside) {
            if (this.isDropdownOpen) {
                this.closeDropdown()
            }
        }
    }

    @HostListener('window:scroll')
    @HostListener('window:resize')
    onWindowScroll(): void {
        if (this.isDropdownOpen) {
            this.updatePosition()
        }
    }

    ngOnInit(): void {
        this.filteredOptions = [...this.options]
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['options']) {
            this.filterOptions()
        }
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
            this.isDropdownOpen = !this.isDropdownOpen
            if (this.isDropdownOpen) {
                this.updatePosition()
            } else {
                this.searchTerm = ''
                this.filterOptions()
            }
        }
    }

    closeDropdown(): void {
        this.isDropdownOpen = false
        this.searchTerm = ''
        this.filterOptions()
    }

    updatePosition(): void {
        const inputElement = this.elementRef.nativeElement.querySelector(
            '.multi-select-input',
        )
        if (inputElement) {
            const rect = inputElement.getBoundingClientRect()
            this.dropdownStyle = {
                position: 'fixed',
                top: `${rect.bottom}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: '1055', // Higher than bootstrap modal (1050)
            }
        }
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement
        this.searchTerm = input.value
        this.filterOptions()
    }

    filterOptions(): void {
        if (!this.searchTerm.trim()) {
            this.filteredOptions = [...this.options]
        } else {
            const searchLower = this.searchTerm.toLowerCase()
            this.filteredOptions = this.options.filter((option) =>
                option.label.toLowerCase().includes(searchLower),
            )
        }
    }

    toggleOption(optionId: string | number): void {
        const index = this.selectedIds.indexOf(optionId)
        if (index > -1) {
            this.selectedIds = this.selectedIds.filter((id) => id !== optionId)
        } else {
            this.selectedIds = [...this.selectedIds, optionId]
        }
        this.emitChanges()
        // If we are using fixed positioning, we might need to manually trigger change detection if strategies differ,
        // but currently we are in the same component.
    }

    isSelected(optionId: string | number): boolean {
        return this.selectedIds.includes(optionId)
    }

    removeOption(optionId: string | number, event?: Event): void {
        if (event) {
            event.stopPropagation()
        }
        this.selectedIds = this.selectedIds.filter((id) => id !== optionId)
        this.emitChanges()
    }

    clearAll(event: Event): void {
        event.stopPropagation()
        this.selectedIds = []
        this.emitChanges()
    }

    getSelectedOptions(): MultiSelectOption[] {
        return this.options.filter((option) =>
            this.selectedIds.includes(option.id),
        )
    }

    private onChange: (value: (string | number)[]) => void = () => {}

    private onTouched: () => void = () => {}

    private emitChanges(): void {
        this.onChange(this.selectedIds)
        this.onTouched()
        this.selectionChange.emit(this.selectedIds)
    }
}
