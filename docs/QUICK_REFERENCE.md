# Quick Reference - Refactored Variable Names

## At a Glance

### Variable Names
```typescript
// ❌ Before (Confusing)
scoreMap: Record<string, any>
selectedExamScheduleId: string | null

// ✅ After (Clear)
examScoresByScheduleId: Record<string, any>
selectedScheduleId: string | null
selectedExamTypeCode: string | null  // NEW
```

### Method Names
```typescript
// ❌ Before
toggleCATModal(examScheduleId?: string)
hasNonNullScores()
getScoreByExamScheduleId(examScheduleId: string)

// ✅ After
toggleScoreModal(scheduleId?: string, examTypeCode?: string)
hasAnyScores()
getScoreByScheduleId(scheduleId: string)
getSelectedExamType(): string | null  // NEW
```

### Removed Methods (Now in Child Components)
```typescript
// ❌ Removed from parent
getGroupedCompetencies()
getCorrectAnswer()
getCorrectAnswersCount()

// ✅ Now handled by app-cat-score component
```

## Usage Examples

### Opening Score Modal
```typescript
// ❌ Before
<button (click)="toggleCATModal(examSchedule.id)">

// ✅ After  
<button (click)="toggleScoreModal(examSchedule.id, examSchedule.examTypeCode)">
```

### Checking for Scores
```typescript
// ❌ Before
*ngIf="hasNonNullScores()"

// ✅ After
*ngIf="hasAnyScores()"
```

### Accessing Scores
```typescript
// ❌ Before
examScoresByScheduleId[scheduleId]

// ✅ After (same, just clearer name)
examScoresByScheduleId[scheduleId]
```

### Rendering Components
```html
<!-- ❌ Before (fragile - checks data structure) -->
<app-cat-score *ngIf="selectedScore.kompetensiIndikatorDtoList">

<!-- ✅ After (explicit - checks exam type) -->
<app-cat-score *ngIf="getSelectedExamType() === ExamTypeCategory.CAT">
```

## Key Principles

1. **Descriptive Names** - `examScoresByScheduleId` tells you exactly what it is
2. **Consistent Naming** - `scheduleId` used everywhere, not mixed with `examScheduleId`
3. **Explicit Logic** - Check exam type, not internal data structure
4. **Single Responsibility** - Parent fetches, children display

## Remember

- Always pass BOTH `scheduleId` AND `examTypeCode` when opening modal
- Use `getSelectedExamType()` to determine which component to render
- Child components handle their own display logic - don't duplicate it
- `examScoresByScheduleId` is keyed by schedule ID (UUID), not exam type code

