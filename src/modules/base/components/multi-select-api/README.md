# Multi-Select API Component

A reusable multi-select component with pagination and API search support.

## Usage

### Basic Example
```typescript
import { MultiSelectApiComponent, MultiSelectApiParams } from '@/modules/base/components/multi-select-api'
import { map } from 'rxjs'

// In your component
fetchParticipants = (params: MultiSelectApiParams): Observable<any[]> => {
    // API expects: ?limit=20&page=1&search=keyword
    return this.participantService.getParticipants(params.limit, params.page, params.search).pipe(
        map(participants => 
            participants.map(p => ({
                id: p.id,
                label: `${p.name} (${p.nip})`,
                ...p // include original data if needed
            }))
        )
    )
}

// In template
<app-multi-select-api
    formControlName="participantIdList"
    [fetchFunction]="fetchParticipants"
    [pageSize]="20"
    placeholder="Select participants..."
    searchPlaceholder="Search participants..."
    (selectionChange)="onParticipantsChange($event)"
></app-multi-select-api>
```

### Custom Search Parameter Example
```typescript
// For APIs with custom search parameter names like 'like_user|name'
// IMPORTANT: Return the full PaginationWrapper with transformed data, not just the array
fetchExaminers = (params: MultiSelectApiParams): Observable<any> => {
    const searchName = params['like_user|name'] || ''
    
    return this.examinerService
        .searchExaminer(params.limit, params.page, searchName)
        .pipe(
            map((response) => {
                // Transform data INSIDE PaginationWrapper to preserve pagination info
                if (response && response.data) {
                    return {
                        ...response, // Keep pagination metadata
                        data: response.data.map((examiner) => ({
                            id: examiner.id,
                            label: examiner.user?.name || examiner.id,
                        })),
                    }
                }
                return response
            }),
        )
}

// In template
<app-multi-select-api
    [fetchFunction]="fetchExaminers"
    [searchParamName]="'like_user|name'"
    formControlName="examinerIdList"
    placeholder="Pilih Penguji"
    searchPlaceholder="Cari penguji..."
    [pageSize]="20"
></app-multi-select-api>
```

## Features
- Infinite scroll pagination (auto-loads next page on scroll)
- Debounced search (default 300ms)
- Custom search parameter names via `searchParamName` input
- Reactive forms support (ControlValueAccessor)
- Supports both PaginationWrapper and direct array responses
- Consistent UI styling with Bootstrap

## API Inputs
- `fetchFunction`: Function to fetch data `(params: MultiSelectApiParams) => Observable<PaginationWrapper<T> | T[]>`
- `searchParamName`: Custom search parameter name (default: 'search')
- `initialSelectedOptions`: Pre-cache selected options with labels (useful for edit forms)
- `placeholder`: Placeholder text for select input
- `searchPlaceholder`: Placeholder text for search input
- `pageSize`: Number of items per page (default: 20)
- `debounceTime`: Search debounce time in ms (default: 300)
- `disabled`: Disable the component
- `maxHeight`: Maximum height of dropdown (default: '250px')

### Edit Form Example (with Initial Selected Values)
```typescript
// In your component
selectedExaminers: MultiSelectOption[] = []

// When loading data for edit
loadExamSchedule(id: string) {
    this.service.getExamSchedule(id).subscribe(data => {
        // Cache selected examiners with labels
        this.selectedExaminers = data.examinerScheduleList.map(e => ({
            id: e.examinerId,
            label: e.examinerUkom?.user?.name || e.examinerId
        }))
        
        // Patch form with IDs
        this.form.patchValue({
            examinerIdList: data.examinerScheduleList.map(e => e.examinerId)
        })
    })
}

// In template
<app-multi-select-api
    [fetchFunction]="fetchExaminers"
    [searchParamName]="'like_user|name'"
    [initialSelectedOptions]="selectedExaminers"
    formControlName="examinerIdList"
    placeholder="Pilih Penguji"
></app-multi-select-api>
```

## Important Notes
- **Pagination**: The component supports both scroll-based and button-based pagination:
  - When there's enough content, users can scroll to bottom to load more
  - When pageSize is small and no scrollbar appears, a "Load More" button is displayed
- **Return Format**: `fetchFunction` must return the full `PaginationWrapper` object (with `currentPage`, `lastPage`, `data`) to enable pagination. If you need to transform data, do it inside the wrapper, not by returning just the array.
- **Dropdown Position**: Uses `position: fixed` to prevent clipping by parent containers with `overflow: hidden`. Automatically repositions on scroll/resize.
- **Initial Selected Options**: For edit forms, pass `initialSelectedOptions` to display selected items with labels immediately without fetching from API.

