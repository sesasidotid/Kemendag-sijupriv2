# Admin Schedule Viewer with Manual Rescheduling

## Overview
A production-ready Angular 17 slot-based schedule viewer with manual rescheduling capability for admin dashboards. Built using AG Grid, standalone components, and strict business rule enforcement.

## Architecture

### File Structure
```
src/
├── modules/ukom/
│   ├── models/
│   │   └── schedule-slot.model.ts          # Domain models
│   └── services/
│       └── schedule-slot.service.ts         # Slot logic & validation
└── sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-wawancara/
    ├── ukom-exam-wawancara.component.ts     # Main AG Grid viewer
    ├── ukom-exam-wawancara.component.html   # Template
    ├── ukom-exam-wawancara.component.scss   # Styles
    └── reschedule-modal/
        ├── reschedule-modal.component.ts    # Reschedule dialog
        ├── reschedule-modal.component.html
        └── reschedule-modal.component.scss
```

---

## Domain Model

### 1. **MainSchedule**
```typescript
interface MainSchedule {
    id: string
    startTime: Date          // Main schedule start
    endTime: Date            // Main schedule end
    duration: number         // Slot duration in hours (e.g., 0.5 = 30 min)
    participantScheduleList: ParticipantSchedule[]
}
```

### 2. **ParticipantSchedule**
```typescript
interface ParticipantSchedule {
    id: string
    participantId: string
    examScheduleId: string
    personalSchedule: Date | null  // ONE scheduled time per participant
    participantName: string
    participantNip?: string
}
```

### 3. **ScheduleSlot**
```typescript
interface ScheduleSlot {
    slotIndex: number        // Sequential slot number
    startTime: Date
    endTime: Date
    isOccupied: boolean      // Has assigned participant
    isUnavailable: boolean   // Falls in 20:00-06:00 blackout
    participantSchedule?: ParticipantSchedule
}
```

### 4. **RescheduleRequest**
```typescript
interface RescheduleRequest {
    participantScheduleId: string
    participantId: string
    newPersonalSchedule: Date
    examScheduleId: string
}
```

---

## Business Rules (STRICT ENFORCEMENT)

### ✅ Valid Schedule Constraints
1. **Within Boundaries**: `mainSchedule.startTime ≤ personalSchedule < mainSchedule.endTime`
2. **No Overlap**: Each time slot can only have ONE participant
3. **Unavailable Hours**: No scheduling during 20:00 → 06:00 (cross-day)
4. **Fixed Duration**: All participants use identical slot duration

### ❌ Validation Logic
All validation happens in `ScheduleSlotService.validateReschedule()`:
```typescript
validateReschedule(
    newSlotTime: Date,
    mainSchedule: MainSchedule,
    excludeParticipantId?: string
): { valid: boolean; reason?: string }
```

**Checks:**
- Time within main schedule bounds
- Not in unavailable hours (20:00-06:00)
- No collision with existing participants (excluding self)

---

## Core Services

### ScheduleSlotService

#### **generateAllSlots(mainSchedule: MainSchedule): ScheduleSlot[]**
Generates all possible time slots:
1. Creates slots from `startTime` to `endTime` using `duration`
2. Marks slots as unavailable if they fall in 20:00-06:00
3. Marks slots as occupied if a participant is scheduled
4. Returns complete slot array for AG Grid

#### **isSlotInUnavailableHours(slotStart: Date, slotEnd: Date): boolean**
Handles cross-day blackout logic:
```typescript
// Unavailable if:
// - Start hour ≥ 20 OR < 6
// - End hour < 6 (crosses midnight)
// - Ends exactly at 06:00
// - Crosses into 20:00
```

#### **getAvailableSlots(allSlots: ScheduleSlot[]): ScheduleSlot[]**
Filters slots for reschedule modal:
```typescript
return allSlots.filter(slot => !slot.isOccupied && !slot.isUnavailable)
```

#### **validateReschedule(...): { valid: boolean; reason?: string }**
Pre-submission validation with detailed error reasons.

---

## UI Components

### 1. Main Viewer: `UkomExamWawancaraComponent`

**Features:**
- AG Grid slot table with 7 columns
- Summary cards (Total, Occupied, Available, Unavailable)
- Color-coded rows:
  - 🟢 Green (#d1e7dd): Occupied slots
  - ⚪ Gray (#f8f9fa): Available slots
  - 🔴 Red (#f8d7da): Unavailable slots (20:00-06:00)

**AG Grid Columns:**
```typescript
[
  { field: 'slotIndex', headerName: 'Slot' },
  { field: 'startTime', headerName: 'Start Time' },
  { field: 'endTime', headerName: 'End Time' },
  { field: 'participantSchedule.participantName', headerName: 'Participant' },
  { field: 'participantSchedule.participantNip', headerName: 'NIP' },
  { valueGetter: 'Status' }, // Available/Occupied/Unavailable
  { cellRenderer: 'Action Button' } // Reschedule button
]
```

**Key Methods:**
- `fetchExamScheduleDetail(examId)`: Loads data from API
- `transformToMainSchedule(exam)`: Converts to domain model
- `openRescheduleModal(slot)`: Opens reschedule dialog
- `confirmReschedule(event)`: Validates and applies change
- `performReschedule(request)`: Mocked API call + in-memory update

---

### 2. Reschedule Modal: `RescheduleModalComponent`

**Purpose:** Admin selects a valid slot from dropdown (NO free text input)

**Workflow:**
1. Modal opens with current participant info
2. Shows current scheduled time (if any)
3. Lists ONLY valid available slots (filtered)
4. Admin clicks to select new slot
5. Confirm button triggers validation
6. Success → Updates grid / Error → Shows alert

**Inputs:**
```typescript
@Input() participant: ParticipantSchedule
@Input() availableSlots: ScheduleSlot[]
@Input() currentSlot: ScheduleSlot | null
```

**Outputs:**
```typescript
@Output() close = new EventEmitter<void>()
@Output() confirm = new EventEmitter<{
    participant: ParticipantSchedule
    newSlot: ScheduleSlot
}>()
```

**UI Features:**
- Clickable slot cards (not dropdown)
- Selected slot highlighted with green checkmark
- Disabled state for invalid selections
- Warning if no selection made

---

## Usage Example

### Component Integration
```typescript
// Parent component template
<app-ukom-exam-wawancara 
    [roomUkomDetail]="roomDetail"
    [examDetail]="examSchedule">
</app-ukom-exam-wawancara>
```

### Data Flow
```
ExamSchedule (API) 
  ↓
transformToMainSchedule()
  ↓
generateAllSlots() 
  ↓
AG Grid RowData
  ↓
User clicks "Reschedule"
  ↓
Open Modal with availableSlots
  ↓
User selects new slot
  ↓
validateReschedule()
  ↓
performReschedule() [API call]
  ↓
Update grid in-memory
```

---

## Rule Enforcement Examples

### ✅ Valid Reschedule
```
Main: 08:00 → 18:00 (duration: 0.5h)
Current: Participant A @ 10:00
New: 14:00 (available, within bounds, not 20:00-06:00)
Result: ✓ Approved
```

### ❌ Invalid: Unavailable Hours
```
Main: 19:00 → 23:00
New: 20:30
Result: ✗ Rejected - "Slot berada di jam tidak tersedia (20:00-06:00)"
```

### ❌ Invalid: Overlap
```
Current: Participant A @ 10:00
New: 10:00 (occupied by Participant B)
Result: ✗ Rejected - "Slot sudah ditempati oleh Participant B"
```

### ❌ Invalid: Out of Bounds
```
Main: 08:00 → 18:00
New: 19:00
Result: ✗ Rejected - "Waktu di luar jadwal utama"
```

---

## API Integration (TODO)

Currently uses in-memory mock. Replace in `performReschedule()`:

```typescript
// Current (mock)
private performReschedule(request: RescheduleRequest): void {
    // Update in-memory
    main.participantScheduleList[index].personalSchedule = request.newPersonalSchedule
}

// Production (real API)
private performReschedule(request: RescheduleRequest): void {
    this.examScheduleService.rescheduleParticipant(request)
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
            next: (response) => {
                this.fetchExamScheduleDetail(this.examDetail().id) // Reload
                this.handlerService.handleAlert('Success', 'Reschedule successful')
            },
            error: (err) => {
                this.handlerService.handleException(err)
            }
        })
}
```

### Expected API Endpoint
```
PUT /api/exam-schedule/{examId}/participant/{participantId}/reschedule
Body: { newPersonalSchedule: "2025-01-15T14:00:00Z" }
Response: { success: boolean, data: ParticipantSchedule }
```

---

## Performance Considerations

### Optimizations for 500 Participants
1. **AG Grid Pagination**: Default 20 rows/page
2. **Virtual Scrolling**: Enabled by default in AG Grid
3. **Signal-based reactivity**: Minimal change detection
4. **Computed properties**: `scheduleSummary` uses getter (cached)

### Memory Usage
- 500 participants × 30min slots over 8 hours = ~1000 slots
- Each slot ~200 bytes = ~200KB total (acceptable)

---

## Testing Checklist

### Unit Tests (Recommended)
- [ ] `generateAllSlots()` with various durations
- [ ] `isSlotInUnavailableHours()` edge cases (midnight crossings)
- [ ] `validateReschedule()` all rejection scenarios
- [ ] Overlap detection with multiple participants

### Integration Tests
- [ ] Modal open/close flow
- [ ] Slot selection and confirmation
- [ ] Grid refresh after reschedule
- [ ] Error alert display

### Manual Testing
- [ ] Load schedule with 100+ participants
- [ ] Reschedule across midnight boundary
- [ ] Attempt to assign occupied slot
- [ ] Verify color coding in grid

---

## Known Limitations

1. **Timezone**: Fixed to UTC+7 (Asia/Jakarta) display - all dates treated as UTC+7 without browser timezone conversion
2. **Multi-day schedules**: Works but UI doesn't group by date
3. **Backend persistence**: Currently mocked
4. **Concurrent edits**: No conflict resolution (last write wins)
5. **Undo/Redo**: Not implemented

---

## Future Enhancements

### Phase 2 Features
- [ ] Drag-and-drop rescheduling (optional)
- [ ] Bulk reschedule (multiple participants)
- [ ] Export schedule to PDF/Excel
- [ ] Real-time updates (WebSocket)
- [ ] Audit log for schedule changes
- [ ] Timezone selector

### Advanced Rules
- [ ] Examiner availability constraints
- [ ] Room capacity limits
- [ ] Break time enforcement
- [ ] Participant preferences

---

## Dependencies

```json
{
  "ag-grid-angular": "^32.3.2",
  "ag-grid-community": "^32.3.2",
  "@angular/core": "^17.x",
  "rxjs": "~7.8"
}
```

**No additional dependencies required!**

---

## Quick Start

### 1. Import in Parent Module
```typescript
import { UkomExamWawancaraComponent } from './path/to/component'

@Component({
    imports: [UkomExamWawancaraComponent],
    // ...
})
```

### 2. Use in Template
```html
<app-ukom-exam-wawancara 
    [examDetail]="selectedExam">
</app-ukom-exam-wawancara>
```

### 3. Provide Exam Data
```typescript
selectedExam: ExamSchedule = {
    id: 'exam-001',
    startTime: '2025-01-15T08:00:00',
    endTime: '2025-01-15T18:00:00',
    duration: 0.5, // 30 minutes
    participantScheduleList: [
        {
            id: 'ps-001',
            participantId: 'p-001',
            examScheduleId: 'exam-001',
            personalSchedule: '2025-01-15T10:00:00',
            participantUkom: { name: 'John Doe', nip: '123456' }
        }
    ]
}
```

---

## Support

For questions or issues:
1. Check business rules in `schedule-slot.service.ts`
2. Review AG Grid docs: https://www.ag-grid.com/angular-data-grid/
3. Validate slot generation logic with debug logs

---

**License**: Internal use only  
**Author**: Senior Angular 17 Engineer  
**Date**: December 30, 2025
