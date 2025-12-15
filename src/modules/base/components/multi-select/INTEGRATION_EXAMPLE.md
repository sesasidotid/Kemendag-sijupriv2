# Integration Example: Exam Schedule with Participants and Examiners

This example shows how to integrate the multi-select component into the exam schedule creation form.

## Step 1: Import the Component

In `ukom-exam-schedule-add.component.ts`:

```typescript
import { MultiSelectComponent, MultiSelectOption } from '@/modules/base/components/multi-select/multi-select.component'

@Component({
    // ...
    imports: [
        // ...existing imports
        MultiSelectComponent,
    ],
})
```

## Step 2: Update the Form to Include Participants and Examiners

```typescript
export class UkomExamScheduleAddComponent {
    // Add these properties
    participantOptions: MultiSelectOption[] = []
    examinerOptions: MultiSelectOption[] = []
    
    // Modify initForm to include the new fields
    initForm() {
        this.examScheduleForm = this.fb.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            examTypeCode: ['', Validators.required],
            duration: ['', Validators.required],
            secretKey: [null, this.catValidator()],
            participantIdList: [[]],  // Add this
            examinerIdList: [[]],     // Add this
        })

        // ...rest of the form setup
    }
    
    ngOnInit() {
        // ...existing code
        this.loadParticipants()
        this.loadExaminers()
    }
    
    // Add these methods to load data
    loadParticipants() {
        // Replace with actual service call
        // Example:
        this.yourParticipantService.getParticipants().subscribe(participants => {
            this.participantOptions = participants.map(p => ({
                id: p.id,
                label: `${p.name} - ${p.nip}`,
                email: p.email
            }))
        })
    }
    
    loadExaminers() {
        // Replace with actual service call
        // Example:
        this.yourExaminerService.getExaminers().subscribe(examiners => {
            this.examinerOptions = examiners.map(e => ({
                id: e.id,
                label: `${e.name} - ${e.expertise}`,
                expertise: e.expertise
            }))
        })
    }
}
```

## Step 3: Update the Template

In `ukom-exam-schedule-add.component.html`, add these fields after the secretKey field:

```html
<!-- After the Secret Key field, add: -->

<div class="row mb-3">
    <label class="col-sm-2 col-form-label fw-bold">
        Peserta
    </label>
    <div class="col-sm-10">
        <app-multi-select
            [options]="participantOptions"
            formControlName="participantIdList"
            placeholder="Pilih peserta ujian..."
            searchPlaceholder="Cari peserta..."
            emptyMessage="Tidak ada peserta tersedia"
            noResultsMessage="Peserta tidak ditemukan"
        >
        </app-multi-select>
        <small class="form-text text-muted">
            Pilih peserta yang akan mengikuti ujian
        </small>
    </div>
</div>

<div class="row mb-3">
    <label class="col-sm-2 col-form-label fw-bold">
        Penguji <span class="text-danger">*</span>
    </label>
    <div class="col-sm-10">
        <app-multi-select
            [options]="examinerOptions"
            formControlName="examinerIdList"
            placeholder="Pilih penguji..."
            searchPlaceholder="Cari penguji..."
            emptyMessage="Tidak ada penguji tersedia"
            noResultsMessage="Penguji tidak ditemukan"
        >
        </app-multi-select>
        <div class="text-danger" *ngIf="getError('examinerIdList', 'Penguji')">
            {{ getError('examinerIdList', 'Penguji') }}
        </div>
        <small class="form-text text-muted">
            Pilih minimal satu penguji untuk ujian ini
        </small>
    </div>
</div>
```

## Step 4: Add Validation (Optional)

If you want to require at least one examiner:

```typescript
initForm() {
    this.examScheduleForm = this.fb.group({
        // ...existing fields
        examinerIdList: [[], Validators.required],  // Make it required
    })
}
```

## Complete Modified submit() Method

The form already maps to CreateExamScheduleRequest which has `participantIdList` and `examinerIdList` properties, so no changes needed:

```typescript
submit() {
    this.confirmationService.open(false).subscribe({
        next: (result) => {
            if (!result.confirmed) return

            this.submitLoading.set(true)

            const request = new CreateExamScheduleRequest(
                this.examScheduleForm.value
            )
            request.roomUkomId = this.id

            if (request.duration) {
                request.duration = Number((request.duration / 60).toFixed(2))
            }

            // participantIdList and examinerIdList will be automatically included
            console.log('Participants:', request.participantIdList)
            console.log('Examiners:', request.examinerIdList)

            this.ukomExamScheduleService
                .createExamSchedule(request)
                .pipe(finalize(() => this.submitLoading.set(false)))
                .subscribe({
                    next: () => {
                        this.handlerService.handleAlert(
                            'Success',
                            'Jadwal ujian berhasil dibuat'
                        )
                        this.examScheduleForm.reset()
                        this.refresh = !this.refresh
                    },
                    error: (err) => {
                        console.error(err)
                        this.handlerService.handleAlert(
                            'Error',
                            'Gagal membuat jadwal ujian'
                        )
                    },
                })
        },
    })
}
```

## Output

The component will return:
- `participantIdList: string[]` - Array of selected participant IDs
- `examinerIdList: string[]` - Array of selected examiner IDs

These arrays are already part of the `CreateExamScheduleRequest` model and will be sent to the backend automatically.

## Styling

The component follows Bootstrap styling and will match the existing form fields automatically. The selected items appear as blue badges with an X button to remove them individually.

