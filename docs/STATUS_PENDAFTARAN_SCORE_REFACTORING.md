# Status Pendaftaran UKom - Score Display Refactoring

## Overview
Refactored the score fetching and display logic in the `status-pendaftaran-ukom` component to follow the same pattern as `ukom-task-detail` component, using exam schedule IDs instead of exam type codes.

## Changes Made

### 1. **TypeScript Component Changes** (`status-pendaftaran-ukom.component.ts`)

#### Import Changes
- Added `CatScoreComponent` - Non-admin CAT score display component
- Added `GenericScoreComponent` - Non-admin generic score display component
- Added `ExamTypeCategory` - Enum for exam type categories

#### New Properties
- `selectedExamScheduleId: string | null` - Tracks which exam schedule is selected for modal display

#### Refactored Methods

##### `getAllScoresFlow(key: string)`
**Before:** Looped through all exam types and fetched scores by exam type code
```typescript
/api/v1/exam_grade/${examCode}?key=${key}
```

**After:** Loops through `finishTask.examSchedule` array and fetches scores by exam schedule ID
```typescript
/api/v1/exam_grade/${examSchedule.id}?key=${key}
```

**Benefits:**
- More accurate - gets scores for specific exam schedules
- Aligns with the participant's actual exam schedule
- Supports multiple exams of the same type
- Uses the correct API endpoint structure

##### `getScoreByExamScheduleId(examScheduleId: string)`
New helper method to retrieve a specific score from the scoreMap by exam schedule ID.

##### `hasNonNullScores()`
New helper method that checks if there are any non-null scores in the scoreMap.

##### `hasVisibleUkomDetails`
Updated getter to use `hasNonNullScores()` for cleaner logic.

##### `viewFile(examScheduleId: string)`
**Before:** Always accessed `scoreMap['MAKALAH']`
**After:** Accepts exam schedule ID parameter and retrieves the correct score

##### `toggleCATModal(examScheduleId?: string)`
**Before:** Simple toggle with no selection tracking
**After:** Accepts exam schedule ID and tracks which score should be displayed in modal

##### `getSelectedScore()`
New method that returns the score for the currently selected exam schedule ID.

##### `getGroupedCompetencies()`
**Before:** Always used `scoreMap['CAT']`
**After:** Uses `getSelectedScore()` to work with the currently selected score

#### scoreMap Structure Change
**Before:**
```typescript
scoreMap: {
  'CAT': CATScore,
  'MAKALAH': MakalahScore,
  'STUDI_KASUS': BaseScore
}
```

**After:**
```typescript
scoreMap: {
  'exam-schedule-id-1': CATScore,
  'exam-schedule-id-2': MakalahScore,
  'exam-schedule-id-3': BaseScore
}
```

### 2. **HTML Template Changes** (`status-pendaftaran-ukom.component.html`)

#### Score Display Section
**Before:** 
- Static checks for `scoreMap['CAT']` and `scoreMap['MAKALAH']`
- No support for other exam types

**After:**
- Dynamic loop through `finishTask.examSchedule`
- Checks `scoreMap[examSchedule.id]`
- Supports CAT, MAKALAH, and any other exam types
- Uses `ExamTypeCategory` enum for type comparison

```html
<ng-container *ngFor="let examSchedule of finishTask.examSchedule">
    <!-- CAT Score -->
    <div *ngIf="scoreMap[examSchedule.id] != null && 
                examSchedule.examTypeCode === ExamTypeCategory.CAT">
        ...
    </div>
    
    <!-- Makalah Score -->
    <div *ngIf="scoreMap[examSchedule.id] != null && 
                examSchedule.examTypeCode === ExamTypeCategory.MAKALAH">
        ...
    </div>
    
    <!-- Other/Generic Scores -->
    <div *ngIf="scoreMap[examSchedule.id] != null && 
                examSchedule.examTypeCode !== ExamTypeCategory.CAT && 
                examSchedule.examTypeCode !== ExamTypeCategory.MAKALAH">
        ...
    </div>
</ng-container>
```

#### Modal Content
**Before:**
- Custom inline implementation for CAT score display
- Mixed presentation logic in template

**After:**
- Uses reusable `app-cat-score` component for CAT scores
- Uses reusable `app-generic-score` component for other exam types
- Cleaner separation of concerns

```html
<app-modal>
    <ng-container *ngIf="getSelectedScore() as selectedScore">
        <app-cat-score 
            *ngIf="selectedScore.kompetensiIndikatorDtoList"
            [score]="selectedScore">
        </app-cat-score>
        
        <app-generic-score
            *ngIf="!selectedScore.kompetensiIndikatorDtoList"
            [score]="selectedScore">
        </app-generic-score>
    </ng-container>
</app-modal>
```

### 3. **Generic Score Component Completion** (`generic-score.component.ts`)

Added missing methods from `generic-score-admin.component.ts`:
- `questionList` getter
- `getTotalScore()` - Calculates total score from answers
- `getMaxScore()` - Calculates maximum possible score from weights
- `getPercentage()` - Calculates percentage score
- `getBadgeClass()` - Returns appropriate CSS class based on score
- `hasUpload()` - Checks if question has file upload
- `getValidationStatus()` - Gets portfolio validation status

Updated HTML template to display score with breakdown:
```html
<div class="total-score-value">{{ score?.score | number: '1.2-2' }}</div>
<div class="total-score-breakdown">
    <span class="badge" [ngClass]="getBadgeClass(getPercentage())">
        {{ getPercentage() }}% ({{ getTotalScore() }}/{{ getMaxScore() }})
    </span>
</div>
```

## Benefits

1. **Accuracy** - Fetches scores for the actual exam schedules assigned to the participant
2. **Flexibility** - Supports multiple exams of the same type
3. **Consistency** - Follows the same pattern as `ukom-task-detail.component`
4. **Reusability** - Uses standardized score display components
5. **Maintainability** - Cleaner code structure with proper separation of concerns
6. **Extensibility** - Easy to add support for new exam types

## API Endpoint Used

```
GET /api/v1/exam_grade/{examScheduleId}?key={participantKey}
```

This endpoint is called for each exam schedule in `finishTask.examSchedule[]`.

## Score Components Used

### For CAT Exams
- `app-cat-score` (non-admin version)
- Displays competency-based breakdown
- Shows percentage and correct/total answers per competency

### For Other Exam Types
- `app-generic-score` (non-admin version)
- Displays total score with percentage
- Shows score breakdown when available
- Supports portfolio validation status

## Testing Recommendations

1. Test with participant having single exam schedule
2. Test with participant having multiple exam schedules of same type
3. Test with participant having mixed exam types (CAT, MAKALAH, etc.)
4. Test modal opening/closing with different exam schedules
5. Test score display for all exam type categories
6. Verify score data is fetched correctly on finish status

## Migration Notes

- The `getAllScores()` method is now unused and can be removed
- The `getExamType()` method is now unused and can be removed
- Old TODO comment about fetching latest scores is now addressed
- `scoreMap` structure has changed - old code expecting exam type keys will not work

