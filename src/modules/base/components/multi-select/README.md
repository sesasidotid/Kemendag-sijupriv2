# Multi-Select Component

A reusable Angular component for selecting multiple options with search functionality.

## Features

- ✅ Multi-select with checkboxes
- 🔍 Built-in search functionality
- 🎨 Bootstrap-styled UI (consistent with project)
- ♿ Accessible (keyboard navigation support)
- 🔧 FormControl compatible (ControlValueAccessor)
- 📦 Standalone component
- 🚀 Lightweight and performant

## Installation

The component is located at:
```
src/modules/base/components/multi-select/
```

## Basic Usage

### 1. Import the Component

```typescript
import { MultiSelectComponent, MultiSelectOption } from '@/modules/base/components/multi-select/multi-select.component'

@Component({
    // ...
    imports: [MultiSelectComponent, /* other imports */]
})
```

### 2. Prepare Your Data

```typescript
export class YourComponent {
    participants: MultiSelectOption[] = [
        { id: '1', label: 'John Doe' },
        { id: '2', label: 'Jane Smith' },
        { id: '3', label: 'Bob Johnson' }
    ]
    
    selectedParticipantIds: string[] = []
}
```

### 3. Use in Template

#### Simple Usage (with two-way binding)
```html
<app-multi-select
    [options]="participants"
    [(ngModel)]="selectedParticipantIds"
    placeholder="Select participants..."
    searchPlaceholder="Search participants..."
>
</app-multi-select>
```

#### Reactive Forms Usage
```typescript
export class YourComponent {
    form = this.fb.group({
        participants: [[]]  // Array of selected IDs
    })
    
    participantOptions: MultiSelectOption[] = [...]
}
```

```html
<form [formGroup]="form">
    <app-multi-select
        [options]="participantOptions"
        formControlName="participants"
        placeholder="Select participants..."
    >
    </app-multi-select>
</form>
```

#### With Event Listener
```html
<app-multi-select
    [options]="participants"
    [(ngModel)]="selectedParticipantIds"
    (selectionChange)="onSelectionChange($event)"
>
</app-multi-select>
```

```typescript
onSelectionChange(selectedIds: (string | number)[]) {
    console.log('Selected IDs:', selectedIds)
    // Handle the selection change
}
```

## API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `options` | `MultiSelectOption[]` | `[]` | Array of options to display |
| `placeholder` | `string` | `'Select options...'` | Placeholder text when no items selected |
| `disabled` | `boolean` | `false` | Disables the component |
| `maxHeight` | `string` | `'250px'` | Maximum height of dropdown menu |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search input |
| `emptyMessage` | `string` | `'No options available'` | Message when options array is empty |
| `noResultsMessage` | `string` | `'No results found'` | Message when search returns no results |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `selectionChange` | `EventEmitter<(string \| number)[]>` | Emits array of selected IDs when selection changes |

### MultiSelectOption Interface

```typescript
interface MultiSelectOption {
    id: string | number      // Unique identifier
    label: string           // Display text
    [key: string]: any     // Additional custom properties
}
```

## Complete Examples

### Example 1: Participant Selection

```typescript
import { Component, OnInit } from '@angular/core'
import { MultiSelectComponent, MultiSelectOption } from '@/modules/base/components/multi-select/multi-select.component'
import { ParticipantService } from './services/participant.service'

@Component({
    selector: 'app-exam-assignment',
    standalone: true,
    imports: [MultiSelectComponent, CommonModule],
    template: `
        <div class="row mb-3">
            <label class="col-sm-2 col-form-label fw-bold">
                Participants <span class="text-danger">*</span>
            </label>
            <div class="col-sm-10">
                <app-multi-select
                    [options]="participantOptions"
                    [(ngModel)]="selectedParticipantIds"
                    placeholder="Select participants..."
                    searchPlaceholder="Search by name..."
                    (selectionChange)="onParticipantChange($event)"
                >
                </app-multi-select>
                <small class="form-text text-muted">
                    Selected: {{ selectedParticipantIds.length }} participant(s)
                </small>
            </div>
        </div>
    `
})
export class ExamAssignmentComponent implements OnInit {
    participantOptions: MultiSelectOption[] = []
    selectedParticipantIds: string[] = []
    
    constructor(private participantService: ParticipantService) {}
    
    ngOnInit() {
        // Load participants from API
        this.participantService.getParticipants().subscribe(participants => {
            this.participantOptions = participants.map(p => ({
                id: p.id,
                label: `${p.name} - ${p.email}`,
                email: p.email,  // Additional data
                department: p.department
            }))
        })
    }
    
    onParticipantChange(selectedIds: (string | number)[]) {
        console.log('Selected participant IDs:', selectedIds)
        // You can access full participant data from participantOptions
        const selectedParticipants = this.participantOptions.filter(
            p => selectedIds.includes(p.id)
        )
        console.log('Full participant data:', selectedParticipants)
    }
}
```

### Example 2: With Form Validation

```typescript
import { Component } from '@angular/core'
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'
import { MultiSelectComponent, MultiSelectOption } from '@/modules/base/components/multi-select/multi-select.component'

@Component({
    selector: 'app-exam-form',
    standalone: true,
    imports: [MultiSelectComponent, ReactiveFormsModule, CommonModule],
    template: `
        <form [formGroup]="examForm" (ngSubmit)="submit()">
            <div class="row mb-3">
                <label class="col-sm-2 col-form-label fw-bold">
                    Examiners <span class="text-danger">*</span>
                </label>
                <div class="col-sm-10">
                    <app-multi-select
                        [options]="examinerOptions"
                        formControlName="examiners"
                        placeholder="Select at least one examiner..."
                    >
                    </app-multi-select>
                    <div class="text-danger" *ngIf="examForm.get('examiners')?.touched && examForm.get('examiners')?.hasError('required')">
                        At least one examiner is required
                    </div>
                </div>
            </div>
            
            <button type="submit" class="btn btn-primary" [disabled]="examForm.invalid">
                Submit
            </button>
        </form>
    `
})
export class ExamFormComponent {
    examForm: FormGroup
    examinerOptions: MultiSelectOption[] = [
        { id: 1, label: 'Dr. Smith' },
        { id: 2, label: 'Dr. Johnson' },
        { id: 3, label: 'Dr. Williams' }
    ]
    
    constructor(private fb: FormBuilder) {
        this.examForm = this.fb.group({
            examiners: [[], Validators.required]  // Required validation
        })
    }
    
    submit() {
        if (this.examForm.valid) {
            const selectedIds = this.examForm.value.examiners
            console.log('Submitting with examiners:', selectedIds)
            // Submit to API
        }
    }
}
```

### Example 3: Dynamic Options Loading

```typescript
import { Component, OnInit } from '@angular/core'
import { MultiSelectComponent, MultiSelectOption } from '@/modules/base/components/multi-select/multi-select.component'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
    selector: 'app-competence-selector',
    standalone: true,
    imports: [MultiSelectComponent, CommonModule],
    template: `
        <div class="row mb-3">
            <label class="col-sm-2 col-form-label fw-bold">Competencies</label>
            <div class="col-sm-10">
                <app-multi-select
                    [options]="competenceOptions"
                    [(ngModel)]="selectedCompetenceIds"
                    placeholder="Select competencies..."
                    searchPlaceholder="Search competencies..."
                    emptyMessage="Loading competencies..."
                >
                </app-multi-select>
            </div>
        </div>
    `
})
export class CompetenceSelectorComponent implements OnInit {
    competenceOptions: MultiSelectOption[] = []
    selectedCompetenceIds: string[] = []
    
    ngOnInit() {
        // Simulate API call
        this.loadCompetencies()
    }
    
    loadCompetencies() {
        // Replace with actual API call
        setTimeout(() => {
            this.competenceOptions = [
                { id: 'C001', label: 'Data Analysis', category: 'Technical' },
                { id: 'C002', label: 'Project Management', category: 'Management' },
                { id: 'C003', label: 'Communication Skills', category: 'Soft Skills' }
            ]
        }, 1000)
    }
}
```

## Styling Customization

The component uses Bootstrap classes and follows the project's styling conventions. You can customize it further by:

### 1. Override SCSS variables in your component
```scss
app-multi-select {
    ::ng-deep {
        .multi-select-input {
            border-color: #custom-color;
        }
        
        .badge {
            background-color: #custom-color !important;
        }
    }
}
```

### 2. Custom max-height for dropdown
```html
<app-multi-select
    [options]="options"
    [(ngModel)]="selected"
    maxHeight="400px"
>
</app-multi-select>
```

## Tips & Best Practices

1. **Always provide unique IDs**: Ensure each option has a unique `id`
2. **Keep labels concise**: Long labels may wrap in badges
3. **Use search for large datasets**: When you have 10+ options
4. **Handle empty states**: Provide meaningful empty/loading messages
5. **Consider accessibility**: The component includes keyboard support
6. **Validate selections**: Use Angular's form validation when needed

## Troubleshooting

### Issue: Selected values not displaying
**Solution**: Ensure the IDs in your model match the IDs in options array (including type - string vs number)

### Issue: Search not working
**Solution**: Make sure options array is populated before rendering

### Issue: Dropdown not closing on outside click
**Solution**: This is handled automatically by the HostListener

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

