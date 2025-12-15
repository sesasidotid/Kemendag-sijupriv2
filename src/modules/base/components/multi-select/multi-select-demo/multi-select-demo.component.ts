import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import {
    MultiSelectComponent,
    MultiSelectOption,
} from '../multi-select.component'

@Component({
    selector: 'app-multi-select-demo',
    standalone: true,
    imports: [
        CommonModule,
        MultiSelectComponent,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './multi-select-demo.component.html',
    styleUrl: './multi-select-demo.component.scss',
})
export class MultiSelectDemoComponent {
    // Example 1: Simple participants data
    participantOptions: MultiSelectOption[] = [
        { id: '1', label: 'John Doe', email: 'john@example.com' },
        { id: '2', label: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', label: 'Bob Johnson', email: 'bob@example.com' },
        { id: '4', label: 'Alice Williams', email: 'alice@example.com' },
        { id: '5', label: 'Charlie Brown', email: 'charlie@example.com' },
        { id: '6', label: 'Diana Prince', email: 'diana@example.com' },
        { id: '7', label: 'Edward Norton', email: 'edward@example.com' },
        { id: '8', label: 'Fiona Green', email: 'fiona@example.com' },
    ]
    selectedParticipants: string[] = []

    // Example 2: Competencies data
    competenceOptions: MultiSelectOption[] = [
        { id: 'C001', label: 'Data Analysis', category: 'Technical' },
        { id: 'C002', label: 'Project Management', category: 'Management' },
        { id: 'C003', label: 'Communication Skills', category: 'Soft Skills' },
        { id: 'C004', label: 'Leadership', category: 'Management' },
        { id: 'C005', label: 'Problem Solving', category: 'Technical' },
        { id: 'C006', label: 'Teamwork', category: 'Soft Skills' },
    ]
    selectedCompetences: string[] = []

    // Example 3: With Reactive Form
    examForm: FormGroup

    constructor(private fb: FormBuilder) {
        this.examForm = this.fb.group({
            examName: ['', Validators.required],
            examiners: [[], Validators.required],
            participants: [[]],
        })
    }

    onParticipantChange(selectedIds: (string | number)[]) {
        console.log('Selected Participant IDs:', selectedIds)
        const selected = this.participantOptions.filter((p) =>
            selectedIds.includes(p.id),
        )
        console.log('Full Participant Data:', selected)
    }

    onCompetenceChange(selectedIds: (string | number)[]) {
        console.log('Selected Competence IDs:', selectedIds)
    }

    submitForm() {
        if (this.examForm.valid) {
            console.log('Form Submitted:', this.examForm.value)
            alert('Form submitted! Check console for values.')
        } else {
            console.log('Form is invalid')
            alert('Please fill all required fields')
        }
    }

    resetForm() {
        this.examForm.reset()
        this.selectedParticipants = []
        this.selectedCompetences = []
    }

    getError(controlName: string): string {
        const control = this.examForm.get(controlName)
        if (control?.hasError('required') && control?.touched) {
            return `${controlName} is required`
        }
        return ''
    }
}
