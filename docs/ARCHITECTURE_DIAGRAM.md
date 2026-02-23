# Clean Architecture Diagram

## Component Structure (After Refactoring)

```
┌─────────────────────────────────────────────────────────────┐
│  status-pendaftaran-ukom.component                          │
│                                                               │
│  Responsibilities:                                            │
│  • Fetch scores by exam schedule ID                          │
│  • Store in examScoresByScheduleId                           │
│  • Track selectedScheduleId & selectedExamTypeCode           │
│  • Display list of exam buttons                              │
│                                                               │
│  Key Properties:                                              │
│  • examScoresByScheduleId: Record<string, any>               │
│  • selectedScheduleId: string | null                         │
│  • selectedExamTypeCode: string | null                       │
│                                                               │
│  Key Methods:                                                 │
│  • getAllScoresFlow(key)        - Fetch all scores           │
│  • toggleScoreModal(id, type)   - Open/close modal           │
│  • getSelectedScore()            - Get current score          │
│  • getSelectedExamType()         - Get current exam type     │
│  • hasAnyScores()                - Check if scores exist     │
│                                                               │
└──────────────┬────────────────────────────────┬──────────────┘
               │                                │
               │ Delegates to                   │ Delegates to
               ▼                                ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  app-cat-score           │    │  app-generic-score       │
│  (Non-Admin)             │    │  (Non-Admin)             │
│                          │    │                          │
│  For: CAT exams          │    │  For: Other exam types   │
│                          │    │                          │
│  Responsibilities:       │    │  Responsibilities:       │
│  • Display total score   │    │  • Display total score   │
│  • Show competencies     │    │  • Show breakdown        │
│  • Calculate percentages │    │  • Calculate percentages │
│  • Group by competency   │    │  • Display info message  │
│                          │    │                          │
│  Own Methods:            │    │  Own Methods:            │
│  • getGroupedCompetencies│    │  • getTotalScore()       │
│  • getCorrectAnswer()    │    │  • getMaxScore()         │
│  • getCorrectAnswersCount│    │  • getPercentage()       │
│                          │    │  • getBadgeClass()       │
└──────────────────────────┘    └──────────────────────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User navigates to status page                            │
│    ?key=PARTICIPANT_KEY                                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Component loads participant data                          │
│    • finishTask populated                                    │
│    • finishTask.examSchedule[] contains schedules            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. getAllScoresFlow(key) called                              │
│    • Loops through finishTask.examSchedule[]                 │
│    • For each: GET /api/v1/exam_grade/{scheduleId}?key=XXX  │
│    • Creates score instances (CATScore, MakalahScore, etc.) │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Scores stored in examScoresByScheduleId                   │
│    {                                                         │
│      'schedule-uuid-1': CATScore {...},                      │
│      'schedule-uuid-2': MakalahScore {...},                  │
│      'schedule-uuid-3': PortofolioScore {...}                │
│    }                                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Template displays list                                    │
│    • Loops through finishTask.examSchedule[]                 │
│    • Shows button if examScoresByScheduleId[schedule.id]     │
│    • Button text: "Lihat Nilai" or "Lihat Makalah"          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. User clicks "Lihat Nilai"                                 │
│    • toggleScoreModal(scheduleId, examTypeCode) called       │
│    • selectedScheduleId = scheduleId                         │
│    • selectedExamTypeCode = examTypeCode                     │
│    • Modal opens                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Modal renders appropriate component                       │
│                                                              │
│    IF getSelectedExamType() === 'CAT':                       │
│       → <app-cat-score [score]="getSelectedScore()">        │
│                                                              │
│    ELSE:                                                     │
│       → <app-generic-score [score]="getSelectedScore()">    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Method Call Flow

```
User Action: Click "Lihat Nilai"
    ↓
toggleScoreModal(scheduleId, examTypeCode)
    ↓
    ├─→ selectedScheduleId = scheduleId
    ├─→ selectedExamTypeCode = examTypeCode
    └─→ isCATModalOpen$.next(true)
         ↓
         Modal template evaluates
         ↓
         getSelectedScore() called
         ↓
         Returns: examScoresByScheduleId[selectedScheduleId]
         ↓
         getSelectedExamType() called
         ↓
         Returns: selectedExamTypeCode
         ↓
         *ngIf condition checks exam type
         ↓
         IF CAT → Render <app-cat-score>
                   ↓
                   Child component receives score
                   ↓
                   Child calls own methods:
                   • getGroupedCompetencies()
                   • getCorrectAnswer()
                   • etc.
         ↓
         ELSE → Render <app-generic-score>
                 ↓
                 Child component receives score
                 ↓
                 Child calls own methods:
                 • getTotalScore()
                 • getMaxScore()
                 • getPercentage()
                 • etc.
```

## Variable Naming Convention

```
Parent Component:
┌──────────────────────────────────────────────────────┐
│ examScoresByScheduleId                               │
│  ↑         ↑          ↑                              │
│  │         │          └─ Descriptive: by schedule ID │
│  │         └─ What it contains: Scores               │
│  └─ What is being scored: Exam                       │
│                                                       │
│ selectedScheduleId                                    │
│  ↑        ↑       ↑                                  │
│  │        │       └─ What it represents: ID          │
│  │        └─ What is selected: Schedule              │
│  └─ State: selected                                  │
│                                                       │
│ selectedExamTypeCode                                 │
│  ↑        ↑    ↑   ↑                                │
│  │        │    │   └─ Format: Code                   │
│  │        │    └─ What: Type                         │
│  │        └─ Category: Exam                          │
│  └─ State: selected                                  │
└──────────────────────────────────────────────────────┘
```

## Responsibility Matrix

| Component | Fetch Data | Store Data | Display List | Calculate | Show Details |
|-----------|-----------|-----------|--------------|-----------|--------------|
| **Parent (status-pendaftaran-ukom)** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Child (app-cat-score)** | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Child (app-generic-score)** | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Yes |

**Key Principle:** Parent fetches and manages, children display and calculate.

## API Integration

```
Component                     API Endpoint
────────────────────────────────────────────────────────────
status-pendaftaran-ukom  →   GET /api/v1/exam_grade/{scheduleId}?key={key}
                              ↓
                              Response: Score data for that schedule
                              ↓
                              Maps to appropriate score class:
                              • CAT → CATScore
                              • MAKALAH → MakalahScore  
                              • Others → BaseScore
                              ↓
                              Stored in examScoresByScheduleId
```

## Type Safety

```typescript
// Enum for exam type categories
ExamTypeCategory {
  CAT = 'CAT',
  MAKALAH = 'MAKALAH',
  PORTOFOLIO = 'PORTOFOLIO',
  STUDI_KASUS = 'STUDI_KASUS',
  PRAKTIK = 'PRAKTIK'
}

// Type-safe component rendering
*ngIf="getSelectedExamType() === ExamTypeCategory.CAT"
       ↑                           ↑
       Returns string | null       Enum value
                                   
       TypeScript ensures type safety at compile time ✅
```

## Summary

This architecture provides:

✅ **Clear separation of concerns**
   - Parent: data management
   - Children: display logic

✅ **Type safety**
   - Enums for exam types
   - Explicit typing

✅ **Maintainability**
   - Clear naming
   - Single responsibility
   - No duplicate code

✅ **Extensibility**
   - Easy to add new exam types
   - Easy to modify display logic
   - Children can be reused

✅ **Testability**
   - Components are independent
   - Clear interfaces
   - Easy to mock

