# UKOM Exam General Component - Structure & Flow
## 📂 Component Structure
```
ukom-exam-general/
├── ukom-exam-general.component.ts          # Main component logic
├── ukom-exam-general.component.html        # Main template with AG Grid
├── ukom-exam-general.component.scss        # Main component styles
└── update-examiner-modal/
    ├── update-examiner-modal.component.ts   # Modal logic
    ├── update-examiner-modal.component.html # Modal template
    └── update-examiner-modal.component.scss # Modal styles
```
## 🔄 Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│              ukom-exam-choose-comp-questions                    │
│                     (Parent Component)                          │
│                                                                 │
│  Inputs:                                                        │
│  - examDetail: ExamSchedule                                     │
│  - examinerList: ExaminerScheduleList[]                         │
│  - participantList: ParticipantScheduleList[]                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UkomExamGeneralComponent                     │
│                                                                 │
│  Processing:                                                    │
│  1. Build examinerMap (id → name)                              │
│  2. Enhance participantList with examiner names:               │
│     - Read examScheduleSupervised array                         │
│     - Map examinerScheduleId → examiner names                   │
│     - Create examinerNamesDisplay (comma-separated)             │
│                                                                 │
│  Display:                                                       │
│  ┌─────────────────────────────────────────────────┐           │
│  │          AG Grid Table                          │           │
│  ├──────┬─────────────┬────────┬──────────┬────────┤           │
│  │  No  │  Name       │  NIP   │ Examiners│ Action │           │
│  ├──────┼─────────────┼────────┼──────────┼────────┤           │
│  │   1  │ John Doe    │ 123456 │ Examiner1│ [Ubah] │           │
│  │   2  │ Jane Smith  │ 789012 │ Examiner2│ [Ubah] │           │
│  └──────┴─────────────┴────────┴──────────┴────────┘           │
│                                                                 │
│  On "Ubah Penguji" click:                                      │
│    - selectedParticipant.set(participant)                       │
│    - showExaminerModal.set(true)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              UpdateExaminerModalComponent                       │
│                                                                 │
│  On Init:                                                       │
│  - Extract current examiner IDs from                            │
│    participant.examScheduleSupervised[]                         │
│  - Store in currentExaminerIds signal                           │
│  - Pre-select in grid                                           │
│                                                                 │
│  Display:                                                       │
│  ┌─────────────────────────────────────────────────┐           │
│  │  Participant Info Card                          │           │
│  │  - Name: John Doe                               │           │
│  │  - NIP: 123456                                  │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │  Current: Examiner1, Examiner2                  │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │          AG Grid (Multiple Selection)           │           │
│  ├─────────────────────┬──────────┬────────────────┤           │
│  │ ☑ Examiner1         │ nip001   │ [Saat Ini]    │ ← Blue BG │
│  │ ☑ Examiner2         │ nip002   │ [Saat Ini]    │ ← Blue BG │
│  │ ☐ Examiner3         │ nip003   │               │           │
│  │ ☐ Examiner4         │ nip004   │               │           │
│  └─────────────────────┴──────────┴────────────────┘           │
│                                                                 │
│  On Selection Change:                                           │
│    - selectedExaminerIds.set([selected IDs])                    │
│    - Update summary: "2 penguji dipilih: Examiner1, ..."       │
│                                                                 │
│  On Confirm:                                                    │
│    - emit({ participant, examinerIds })                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│           UkomExamGeneralComponent.confirmExaminerUpdate()      │
│                                                                 │
│  Current Implementation:                                        │
│  - console.log(TODO message)                                    │
│  - alert('TODO: Implementasi API...')                           │
│  - closeExaminerModal()                                         │
│                                                                 │
│  Future Implementation (when API ready):                        │
│  1. Create request object:                                      │
│     UpdateExaminerForParticipantRequest({                       │
│       participantScheduleId,                                    │
│       examinerScheduleIdList                                    │
│     })                                                          │
│  2. Call API via service                                        │
│  3. On success:                                                 │
│     - closeExaminerModal()                                      │
│     - participantListRefresh.emit()                             │
│     - show success notification                                 │
│  4. On error:                                                   │
│     - show error notification                                   │
│     - keep modal open                                           │
└─────────────────────────────────────────────────────────────────┘
```
## 🎯 Component Inputs & Outputs
### UkomExamGeneralComponent
**Inputs:**
```typescript
examDetail = input<ExamSchedule>()
examinerList = input.required<ExaminerScheduleList[]>()
participantList = input<ParticipantScheduleList[]>([])
```
**Outputs:**
```typescript
participantListRefresh = output()  // Emits when data needs refresh
```
### UpdateExaminerModalComponent
**Inputs:**
```typescript
@Input() participant!: ParticipantScheduleList
@Input() examinerList: ExaminerScheduleList[] = []
```
**Outputs:**
```typescript
@Output() close = new EventEmitter<void>()
@Output() confirm = new EventEmitter<{
    participant: ParticipantScheduleList
    examinerIds: string[]
}>()
```
## 📊 Data Transformation
### From API Response to Display:
```typescript
// Input: ParticipantScheduleList from API
{
  id: "participant-123",
  participantId: "user-456",
  participantUkom: {
    name: "John Doe",
    nip: "123456"
  },
  examScheduleSupervised: [
    { examinerScheduleId: "examiner-001" },
    { examinerScheduleId: "examiner-002" }
  ]
}
// Transformation in participantsWithExaminers computed:
// 1. Build examinerMap: Map<"examiner-001", "Examiner Name 1">
// 2. Map examScheduleSupervised to names
// 3. Join with comma
// Output: Enhanced participant data for AG Grid
{
  ...originalParticipant,
  examinerNamesDisplay: "Examiner Name 1, Examiner Name 2",
  examinerIds: ["examiner-001", "examiner-002"]
}
```
## 🎨 Visual States
### Main Component States:
1. **Loading State**: _(handled by parent)_
2. **Empty State**: 
   - Shows when `participantsWithExaminers().length === 0`
   - Displays info alert: "Belum ada peserta terdaftar"
3. **Data State**: 
   - Shows AG Grid with all participants
   - Summary cards showing counts
### Modal States:
1. **Initial State**: 
   - Current examiners pre-selected (blue background)
   - Selection count matches current examiners
2. **Selecting State**: 
   - User can click rows to select/deselect
   - Selected rows show green background
   - Summary updates dynamically
3. **Validation State**: 
   - If no examiner selected: Show warning alert
   - If examiners selected: Show success alert with count
## 🔍 Key Features
### 1. Multiple Examiner Support
- Unlike WAWANCARA (single examiner per slot)
- Reads from `examScheduleSupervised` array
- Can assign multiple examiners per participant
### 2. Pre-selection Logic
```typescript
ngOnInit() {
  // Extract current examiner IDs
  const currentIds = participant.examScheduleSupervised
    .map(s => s.examinerScheduleId)
  // Set signals
  currentExaminerIds.set(currentIds)
  selectedExaminerIds.set([...currentIds])
  // Pre-select in grid (happens in onGridReady)
}
```
### 3. Dynamic Examiner Display
```typescript
examinerMap = computed(() => {
  // Create Map for O(1) lookup
  return new Map(
    examinerList().map(e => [
      e.id, 
      e.examinerUkom?.user?.name || 'Unknown'
    ])
  )
})
participantsWithExaminers = computed(() => {
  // Use examinerMap to get names
  const examinerNames = participant.examScheduleSupervised
    ?.map(s => examinerMap.get(s.examinerScheduleId))
    .join(', ') || 'Belum ada penguji'
  return { ...participant, examinerNamesDisplay: examinerNames }
})
```
## 🚀 Usage in Parent Component
```html
<!-- Conditional rendering based on exam type -->
<ng-container *ngIf="typeUkom() === ExamTypeCategory.PRAKTIK">
  <app-ukom-exam-general 
    (participantListRefresh)="refreshParticipantList()" 
    [examDetail]="examDetail()"
    [examinerList]="examinerList()" 
    [participantList]="participantList()">
  </app-ukom-exam-general>
</ng-container>
<!-- Repeat for PORTOFOLIO and STUDI_KASUS -->
```
## 📋 Checklist for API Integration
When implementing the API:
- [ ] Backend: Create endpoint for updating examiners
- [ ] Backend: Handle `examinerScheduleIdList` array
- [ ] Backend: Update `examScheduleSupervised` table
- [ ] Frontend: Create/update request model
- [ ] Frontend: Add service method
- [ ] Frontend: Replace placeholder in `confirmExaminerUpdate()`
- [ ] Frontend: Add loading state during API call
- [ ] Frontend: Add error handling
- [ ] Frontend: Add success notification
- [ ] Frontend: Emit refresh signal
- [ ] Testing: Test with single examiner
- [ ] Testing: Test with multiple examiners
- [ ] Testing: Test examiner removal
- [ ] Testing: Test error scenarios
## 🎓 Learning Points
1. **Component Reusability**: Same component for 3 exam types
2. **Signal-based State**: Using Angular signals for reactive updates
3. **Computed Values**: Efficient data transformation with `computed()`
4. **AG Grid Integration**: Professional data grid with multi-select
5. **Modal Pattern**: Reusable modal for examiner selection
6. **Type Safety**: Full TypeScript typing throughout
7. **Separation of Concerns**: Logic, template, and styles separated
