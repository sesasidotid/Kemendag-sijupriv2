# Ukom Task Detail Component - Exam Score Display Update

## Overview
Updated the `ukom-task-detail.component` to display all exam score types (not just CAT), following the same pattern as `status-pendaftaran-ukom.component`, with the addition of delete score actions and using admin score components.

## Date
February 23, 2026

## Changes Made

### 1. TypeScript Component (`ukom-task-detail.component.ts`)

#### Added Imports
```typescript
import {
    CATScore,
    MakalahScore,
    PortofolioScore,
    PraktikScore,
    StudiKasusScore,
} from '@/modules/ukom/models/exam/exam-score.model'
import { GenericScoreAdminComponent } from '@/modules/ukom/components/generic-score-admin/generic-score-admin.component'
```

#### Added Property
- `selectedExamTypeCode: string | null = null` - Tracks the selected exam type for modal display

#### Updated Methods

**`getAllScores()`**
- Now handles all exam types: CAT, MAKALAH, STUDI_KASUS, PRAKTIK, PORTOFOLIO
- Creates appropriate score instances based on exam type code
- Uses a switch statement similar to status-pendaftaran-ukom component

**`toggleModal()`**
- Updated signature: `toggleModal(examId?: string, examTypeCode?: string)`
- Now accepts and stores the exam type code

**`getSelectedScore()`**
- Changed return type from `CATScore | null` to `ScoreValue | null`
- Returns the generic score type to support all exam types

**`getSelectedExamType()`**
- New method that returns the selected exam type code

### 2. HTML Template (`ukom-task-detail.component.html`)

#### Score Display Section
Updated the score list to display all exam types with appropriate actions:

**CAT Exam**
- Shows "Lihat Nilai" button → Opens modal with CAT score details
- Shows "Hapus Nilai" button → Deletes the exam score

**Makalah Exam**
- Shows "Lihat File" button → Opens file preview
- Shows "Lihat Nilai" button → Opens modal with score details
- Shows "Hapus Nilai" button → Deletes the exam score

**Other Exam Types** (Portofolio, Studi Kasus, Praktik, etc.)
- Shows "Lihat Nilai" button → Opens modal with score details
- Shows "Hapus Nilai" button → Deletes the exam score

#### Modal Section
Updated to conditionally display the appropriate score component:

```html
<app-modal>
    <ng-container *ngIf="getSelectedScore() as selectedScore">
        <!-- CAT Score Component -->
        <app-cat-score-admin
            *ngIf="getSelectedExamType() === ExamTypeCategory.CAT"
            [score]="$any(selectedScore)">
        </app-cat-score-admin>

        <!-- Generic Score Component for other exam types -->
        <app-generic-score-admin
            *ngIf="getSelectedExamType() !== ExamTypeCategory.CAT"
            [score]="$any(selectedScore)"
            [examType]="ukomMiscellaneousService.getModuleDisplayName(getSelectedExamType())">
        </app-generic-score-admin>
    </ng-container>
</app-modal>
```

### 3. Generic Score Admin Component Fix

#### TypeScript (`generic-score-admin.component.ts`)
Added `getChildQuestions()` method to support hierarchical questions:
```typescript
getChildQuestions(parentQuestionId: string): any[] {
    return this.questionList.filter(
        (q) => q.parentQuestionId === parentQuestionId,
    )
}
```

#### HTML (`generic-score-admin.component.html`)
Fixed template to use method instead of inline arrow function:
```html
<div *ngFor="let childQuestion of getChildQuestions(question.id)">
```

This resolves Angular's "Bindings cannot contain assignments" error.

## Key Differences from status-pendaftaran-ukom

1. **Admin Components**: Uses `app-cat-score-admin` and `app-generic-score-admin` instead of the regular user-facing components
2. **Delete Actions**: Every exam type has a "Hapus Nilai" (Delete Score) button with loading state
3. **Makalah Display**: Shows both "Lihat File" and "Lihat Nilai" buttons for Makalah exams

## Supported Exam Types

| Exam Type | Display Component | Actions Available |
|-----------|------------------|-------------------|
| CAT | CatScoreAdminComponent | View Score, Delete Score |
| Makalah | GenericScoreAdminComponent | View File, View Score, Delete Score |
| Portofolio | GenericScoreAdminComponent | View Score, Delete Score |
| Studi Kasus | GenericScoreAdminComponent | View Score, Delete Score |
| Praktik | GenericScoreAdminComponent | View Score, Delete Score |

## Benefits

1. **Complete Coverage**: All exam types are now displayed, not just CAT
2. **Consistent Pattern**: Follows the same display logic as status-pendaftaran-ukom
3. **Admin Features**: Includes delete functionality for score management
4. **Type Safety**: Proper TypeScript typing with ScoreValue union type
5. **Maintainability**: Uses reusable admin score components

## Testing Checklist

- [ ] CAT scores display correctly with modal
- [ ] Makalah scores show file view and score modal
- [ ] Portofolio scores display with validation status
- [ ] Studi Kasus scores show individual questions
- [ ] Praktik scores show hierarchical questions
- [ ] Delete score action works for all exam types
- [ ] Modal closes properly
- [ ] No console errors
- [ ] Loading states work correctly

## Files Modified

1. `/src/sijupri-admin/ukom/ukom-pemetaan/ukom-task-detail/ukom-task-detail.component.ts`
2. `/src/sijupri-admin/ukom/ukom-pemetaan/ukom-task-detail/ukom-task-detail.component.html`
3. `/src/modules/ukom/components/generic-score-admin/generic-score-admin.component.ts`
4. `/src/modules/ukom/components/generic-score-admin/generic-score-admin.component.html`

## Related Documentation

- [Admin Exam Score Components](./ADMIN_EXAM_SCORE_COMPONENTS.md)
- [Status Pendaftaran Score Refactoring](./STATUS_PENDAFTARAN_SCORE_REFACTORING.md)
- [Exam Score Modal Refactoring](./EXAM_SCORE_MODAL_REFACTORING.md)

