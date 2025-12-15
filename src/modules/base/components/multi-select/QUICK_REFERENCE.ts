// ============================================
// MULTI-SELECT COMPONENT - QUICK REFERENCE
// ============================================

// 📍 LOCATION
// src/modules/base/components/multi-select/

// 📥 IMPORT

// 📋 DATA INTERFACE
interface MultiSelectOption {
    id: string | number // Required: Unique identifier
    label: string // Required: Display text
    [key: string]: any // Optional: Any additional data
}

// 🎯 BASIC USAGE - Two-way Binding
/*
Template:
<app-multi-select
    [options]="options"
    [(ngModel)]="selectedIds"
    placeholder="Select..."
></app-multi-select>

Component:
options: MultiSelectOption[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' }
]
selectedIds: string[] = []
*/

// 🎯 REACTIVE FORMS USAGE
/*
Template:
<app-multi-select
    [options]="options"
    formControlName="selectedItems"
></app-multi-select>

Component:
form = this.fb.group({
    selectedItems: [[], Validators.required]
})
options: MultiSelectOption[] = [...]
*/

// 🎯 WITH EVENT LISTENER
/*
Template:
<app-multi-select
    [options]="options"
    [(ngModel)]="selectedIds"
    (selectionChange)="onSelectionChange($event)"
></app-multi-select>

Component:
onSelectionChange(ids: (string | number)[]) {
    console.log('Selected:', ids)
    // Get full objects if needed:
    const selected = this.options.filter(opt => ids.includes(opt.id))
}
*/

// 🎯 ALL AVAILABLE INPUTS
/*
<app-multi-select
    [options]="options"                          // Required
    [(ngModel)]="selectedIds"                    // Optional (or use formControlName)
    [placeholder]="'Select options...'"          // Optional
    [searchPlaceholder]="'Search...'"            // Optional
    [emptyMessage]="'No options available'"      // Optional
    [noResultsMessage]="'No results found'"      // Optional
    [maxHeight]="'250px'"                        // Optional
    [disabled]="false"                           // Optional
    (selectionChange)="onSelectionChange($event)" // Optional
></app-multi-select>
*/

// 📤 OUTPUT
// Returns: Array of IDs (string[] or number[])
// Example: ['1', '3', '5'] or [1, 3, 5]

// 💡 REAL EXAMPLE - Participants Selection
/*
// Component
export class ExamScheduleComponent {
    participantOptions: MultiSelectOption[] = []
    selectedParticipantIds: string[] = []

    ngOnInit() {
        this.loadParticipants()
    }

    loadParticipants() {
        this.participantService.getAll().subscribe(participants => {
            this.participantOptions = participants.map(p => ({
                id: p.id,
                label: `${p.name} - ${p.nip}`,
                email: p.email,
                department: p.department
            }))
        })
    }

    onParticipantChange(ids: (string | number)[]) {
        console.log('Selected IDs:', ids)
        // Get full data if needed
        const selectedParticipants = this.participantOptions.filter(
            p => ids.includes(p.id)
        )
    }
}

// Template
<div class="row mb-3">
    <label class="col-sm-2 col-form-label fw-bold">
        Participants
    </label>
    <div class="col-sm-10">
        <app-multi-select
            [options]="participantOptions"
            [(ngModel)]="selectedParticipantIds"
            placeholder="Select participants..."
            searchPlaceholder="Search by name..."
            (selectionChange)="onParticipantChange($event)"
        ></app-multi-select>
    </div>
</div>
*/

// ✅ FEATURES
// - Multi-selection with checkboxes
// - Search/filter functionality
// - Bootstrap styling (consistent with project)
// - Works with Reactive Forms (formControlName)
// - Works with Template Forms (ngModel)
// - Click outside to close
// - Clear all button
// - Individual item removal
// - Empty state messages
// - Accessible (keyboard support)

// 🎨 UI ELEMENTS
// - Main select box (looks like form-control)
// - Selected items as badges (Bootstrap primary)
// - Dropdown with search input
// - Checkboxes for each option
// - X button on badges to remove
// - X button next to arrow to clear all

// 📖 DOCUMENTATION
// Full docs: README.md
// Integration guide: INTEGRATION_EXAMPLE.md
// Summary: SUMMARY.md
// Demo: multi-select-demo/

// 🔗 RELATED FILES
// - multi-select.component.ts
// - multi-select.component.html
// - multi-select.component.scss
// - multi-select.component.spec.ts
