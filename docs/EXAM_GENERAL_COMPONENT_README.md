# UKOM Exam General Component

## Overview

This component provides a generic interface for managing exam schedules for **PRAKTIK**, **PORTOFOLIO**, and **STUDI_KASUS** exam types. Unlike the WAWANCARA component which uses time-slot scheduling, this component displays participants in a simple table format with their assigned examiners.

## Components Created

### 1. Main Component: `UkomExamGeneralComponent`

**Location:** `/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-general/`

**Purpose:** Displays participant list with their examiners and allows changing examiner assignments.

#### Features:
- Displays all participants in an AG Grid table
- Shows examiner information from `examScheduleSupervised` array
- Supports multiple examiners per participant
- Provides action button to change examiners
- Summary cards showing total participants and examiners

#### Inputs:
- `examDetail`: ExamSchedule - The exam schedule details
- `examinerList`: ExaminerScheduleList[] (required) - List of available examiners
- `participantList`: ParticipantScheduleList[] - List of participants

#### Outputs:
- `participantListRefresh`: Emits when participant list needs to be refreshed

#### Key Properties:
```typescript
// Enhanced participant data with examiner names
participantsWithExaminers = computed(() => {
    // Maps participant.examScheduleSupervised to examiner names
})

// Examiner map for quick lookup
examinerMap = computed(() => {
    // Maps examiner IDs to names
})
```

### 2. Modal Component: `UpdateExaminerModalComponent`

**Location:** `/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-general/update-examiner-modal/`

**Purpose:** Modal dialog for updating/changing examiners for a selected participant.

#### Features:
- Displays participant information
- Shows current examiners
- AG Grid with multiple selection for choosing examiners
- Pre-selects current examiners
- Visual feedback for selected examiners
- Validation to ensure at least one examiner is selected

#### Inputs:
- `participant`: ParticipantScheduleList - The participant to update
- `examinerList`: ExaminerScheduleList[] - List of available examiners

#### Outputs:
- `close`: Emits when modal is closed
- `confirm`: Emits with selected examiner IDs when user confirms

#### Key Properties:
```typescript
selectedExaminerIds = signal<string[]>([])  // Currently selected examiner IDs
currentExaminerIds = signal<string[]>([])   // Original examiner IDs
```

## Integration

### In Parent Component (`ukom-exam-choose-comp-questions`)

The component is integrated in the parent template for PRAKTIK, PORTOFOLIO, and STUDI_KASUS exam types:

```html
<ng-container *ngIf="typeUkom() === ExamTypeCategory.PRAKTIK">
    <app-ukom-exam-general 
        (participantListRefresh)="refreshParticipantList()" 
        [examDetail]="examDetail()"
        [examinerList]="examinerList()" 
        [participantList]="participantList()">
    </app-ukom-exam-general>
</ng-container>

<ng-container *ngIf="typeUkom() === ExamTypeCategory.PORTOFOLIO">
    <app-ukom-exam-general 
        (participantListRefresh)="refreshParticipantList()" 
        [examDetail]="examDetail()"
        [examinerList]="examinerList()" 
        [participantList]="participantList()">
    </app-ukom-exam-general>
</ng-container>

<ng-container *ngIf="typeUkom() === ExamTypeCategory.STUDI_KASUS">
    <app-ukom-exam-general 
        (participantListRefresh)="refreshParticipantList()" 
        [examDetail]="examDetail()"
        [examinerList]="examinerList()" 
        [participantList]="participantList()">
    </app-ukom-exam-general>
</ng-container>
```

## Data Structure

### Participant Data with Examiners

The component reads examiner information from `participant.examScheduleSupervised`:

```typescript
interface ParticipantScheduleList {
    id: string
    participantId: string
    examScheduleId: string
    participantUkom?: {
        name: string
        nip: string
    }
    examScheduleSupervised?: Array<{
        examinerScheduleId: string
        // ... other fields
    }>
}
```

### Examiner Data

```typescript
interface ExaminerScheduleList {
    id: string
    examinerUkom?: {
        user?: {
            name: string
        }
        nip: string
    }
}
```

## TODO: API Integration

The component currently has a placeholder for the API call to update examiners. The actual implementation needs to be completed:

```typescript
confirmExaminerUpdate(event: {
    participant: ParticipantScheduleList
    examinerIds: string[]
}): void {
    const { participant, examinerIds } = event

    // TODO: Call API to update examiner
    // const request = new UpdateExaminerForParticipantRequest({
    //     participantScheduleId: participant.id,
    //     examinerScheduleIdList: examinerIds,
    // })
    // this.performExaminerUpdate(request)

    console.log('TODO: Update examiner for participant', {
        participantId: participant.id,
        participantName: participant.participantUkom?.name,
        examinerIds,
    })

    alert('TODO: Implementasi API untuk mengubah penguji')
}
```

### Required API Endpoint

When implementing the API, create an endpoint similar to:

```typescript
POST /api/v1/exam-schedule/participant/{participantScheduleId}/examiners

Request Body:
{
    examinerScheduleIdList: string[]
}
```

### Implementation Steps:

1. Create the API endpoint in the backend
2. Create/update the request model `UpdateExaminerForParticipantRequest`
3. Add the service method in `UkomExamScheduleService`:
   ```typescript
   updateExaminerForParticipantScheduleByParticipantScheduleId(
       request: UpdateExaminerForParticipantRequest
   ): Observable<any>
   ```
4. Replace the placeholder code in `confirmExaminerUpdate()` with actual API call
5. Add proper error handling
6. Emit `participantListRefresh` after successful update

## Styling

### Component Styles
- Summary cards with shadows and hover effects
- AG Grid with custom styling
- Responsive layout using Bootstrap grid system

### Modal Styles
- Current examiners highlighted with light blue background
- Selected rows highlighted with light green background
- Hover effects on rows
- Custom AG Grid theme integration

## Usage Example

```typescript
// In parent component
<app-ukom-exam-general
    (participantListRefresh)="refreshParticipantList()"
    [examDetail]="examDetail()"
    [examinerList]="examinerList()"
    [participantList]="participantList()"
>
</app-ukom-exam-general>

// Handling refresh
refreshParticipantList() {
    this.getParticipantList()
}
```

## Differences from WAWANCARA Component

| Feature | WAWANCARA | PRAKTIK/PORTOFOLIO/STUDI_KASUS |
|---------|-----------|--------------------------------|
| Time Slots | Yes (with scheduling) | No (simple list) |
| Schedule View | Time-based grid | Simple table |
| Examiner Assignment | Single examiner per slot | Multiple examiners supported |
| Rescheduling | Yes | No (not applicable) |
| Action Buttons | Reschedule + Change Examiner | Change Examiner only |

## Testing Checklist

- [ ] Component displays participant list correctly
- [ ] Examiner names are displayed from `examScheduleSupervised`
- [ ] Modal opens when "Ubah Penguji" button is clicked
- [ ] Current examiners are pre-selected in the modal
- [ ] Multiple examiners can be selected
- [ ] Validation prevents saving without any examiner selected
- [ ] Modal closes after confirmation
- [ ] TODO placeholder alert is shown (until API is implemented)
- [ ] Component works for PRAKTIK exam type
- [ ] Component works for PORTOFOLIO exam type
- [ ] Component works for STUDI_KASUS exam type

## Future Enhancements

1. **API Integration**: Complete the backend API and integrate with the component
2. **Bulk Operations**: Add ability to assign examiners to multiple participants at once
3. **Filtering**: Add filters for participant search
4. **Export**: Add export functionality for participant-examiner assignments
5. **History**: Track and display examiner change history
6. **Notifications**: Add real-time notifications when examiners are updated

## Related Files

- `/src/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model.ts`
- `/src/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model.ts`
- `/src/modules/ukom/models/exam-schedule/update-examiner-for-participant-request.model.ts` (to be created)
- `/src/modules/ukom/services/ukom-exam-schedule.service.ts`

## Notes

- The component uses Angular signals for reactive state management
- AG Grid is used for both the main table and examiner selection
- The component follows the same patterns as other exam type components
- Bootstrap classes are used for styling consistency
- Material Design Icons (mdi) are used for icons

