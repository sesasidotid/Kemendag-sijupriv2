# Timeline Modal Implementation with Date Range Filter

## Overview
This document describes the implementation of a timeline modal feature that allows users to view exam schedules by selecting a date range. The implementation uses the `getAllExamScheduleCalendar` API endpoint and displays the data in both table and Gantt chart views.

## Implementation Summary

### Component: `ukom-class-list.component.ts`

#### New Properties Added
```typescript
dateRangeForm: FormGroup              // Form for date range selection
isLoadingSchedules = signal(false)    // Loading state for API call
hasLoadedSchedules = signal(false)    // Track if data has been loaded
```

#### Service Integration
- Injected `UkomExamScheduleService` to access the calendar API
- Service method used: `getAllExamScheduleCalendar(payload: ExamScheduleCalendarPayload)`

#### Key Methods

##### 1. `openTimelineModal()`
- Opens the modal without pre-loading data
- Resets states and form to current month's date range
- Default date range: First day to last day of current month

##### 2. `loadSchedules()`
- Validates date range form
- Calls API with selected date range
- Transforms API response to `ScheduleItem[]` format
- Updates timeline schedules and displays data

##### 3. `transformToScheduleItems(data: any[])`
- Maps API response (`ExamScheduleCalendar[]`) to `ScheduleItem[]`
- Extracts participant and exam schedule information
- Calculates duration from `personalSchedule` and `personalScheduleEnd`
- Properties mapped:
  - `participantScheduleId`: from `item.id`
  - `examScheduleId`: from `item.examScheduleId`
  - `personalSchedule`: from `item.personalSchedule`
  - `duration`: calculated in hours
  - `name`: from `item.participantUkom.name`
  - `email`: from `item.participantUkom.email`
  - `phone`: from `item.participantUkom.phone`
  - `nip`: from `item.participantUkom.nip`
  - `jabatanName`: from `item.examSchedule.roomUkom.jabatanName`
  - `jenjangName`: from `item.examSchedule.roomUkom.jenjangName`
  - `unitKerjaName`: from `item.participantUkom.unitKerjaName`
  - `jenisUkom`: from `item.examSchedule.examTypeCode`

##### 4. `calculateDuration(start: string, end: string)`
- Calculates duration in hours between two datetime strings
- Returns minimum of 0.25 hours (15 minutes)

##### 5. `formatDate(date: Date)`
- Formats date to `YYYY-MM-DD` format for API payload

##### 6. `closeTimelineModal()`
- Closes modal and resets all states

### Template: `ukom-class-list.component.html`

#### Date Range Form Section
```html
<div class="date-range-section mb-3">
    <form [formGroup]="dateRangeForm" class="row g-3 align-items-end">
        <!-- Start Date Input -->
        <div class="col-md-4">
            <label>Tanggal Mulai</label>
            <input type="date" formControlName="startDate" />
        </div>
        
        <!-- End Date Input -->
        <div class="col-md-4">
            <label>Tanggal Akhir</label>
            <input type="date" formControlName="endDate" />
        </div>
        
        <!-- Submit Button -->
        <div class="col-md-4">
            <button (click)="loadSchedules()">
                Tampilkan Data
            </button>
        </div>
    </form>
</div>
```

#### Conditional Display States

1. **Initial State** (No data loaded):
   - Shows message: "Silakan pilih rentang tanggal dan klik 'Tampilkan Data' untuk melihat jadwal ujian"

2. **Empty Results** (Data loaded but no schedules):
   - Shows message: "Tidak ada jadwal ujian pada rentang tanggal yang dipilih"

3. **Data Display** (Schedules available):
   - Shows `app-schedule-timeline-modal` component with data

### Styling: `ukom-class-list.component.scss`

```scss
.timeline-modal-wrapper {
    .date-range-section {
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
}
```

## API Integration

### Endpoint
`GET /api/v1/exam_schedule/calendar?startDate={startDate}&endDate={endDate}`

### Request Payload
```typescript
interface ExamScheduleCalendarPayload {
    startDate: string  // Format: YYYY-MM-DD (e.g., "2026-02-01")
    endDate: string    // Format: YYYY-MM-DD (e.g., "2026-02-28")
}
```

### Response Model
```typescript
class ExamScheduleCalendar {
    id: string
    participantId: string
    examScheduleId: string
    personalSchedule: string | null
    personalScheduleEnd: string | null
    examSchedule: ExamSchedule
    participantUkom: Participant
}
```

## User Flow

1. User clicks **"Lihat Timeline Jadwal"** button
2. Modal opens with:
   - Date range form (pre-filled with current month)
   - Empty state message
3. User selects start and end dates
4. User clicks **"Tampilkan Data"** button
5. System:
   - Validates date inputs
   - Shows loading spinner
   - Calls API with selected dates
   - Transforms response data
   - Displays schedules in table/Gantt view
6. User can:
   - Toggle between Table and Gantt Chart views
   - Select different date ranges to reload data
   - Close modal

## Error Handling

- **Form Validation**: Shows alert if dates are not selected
- **API Error**: Shows error alert "Gagal memuat data jadwal"
- **Loading State**: Button shows spinner and is disabled during API call

## Features

✅ Date range selection with default current month
✅ API integration with proper payload transformation
✅ Loading states and error handling
✅ Empty state handling
✅ Dual view modes (Table and Gantt Chart)
✅ Responsive design
✅ Form validation

## Dependencies

- `UkomExamScheduleService` - API service
- `HandlerService` - Alert handling
- `ScheduleTimelineModalComponent` - Timeline display component
- `ReactiveFormsModule` - Form handling

## Future Enhancements

✅ Add export functionality (PDF, Excel) - **COMPLETED** (Excel export implemented)
- Add filters (by jabatan, jenjang, participant status)
- Add search functionality
- Add pagination for large datasets
- Add calendar date picker for better UX
- Cache loaded data to reduce API calls
