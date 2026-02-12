# Exam Score Modal Refactoring

## Overview
Refactored the exam score modal to support all exam types with proper component-based architecture. Previously, the modal only displayed CAT exam scores with competency breakdown. Now it supports all exam types with appropriate display logic.

## Changes Made

### 1. New Components Created

#### a. `CatScoreComponent` (`/src/modules/ukom/components/cat-score/`)
- **Purpose**: Display CAT exam scores with competency breakdown
- **Features**:
  - Shows overall score
  - Groups competencies with percentage breakdown
  - Shows correct/total questions per competency
- **Input**: `score: CATScore | null`

#### b. `GenericScoreComponent` (`/src/modules/ukom/components/generic-score/`)
- **Purpose**: Display simple score for all other exam types
- **Features**:
  - Shows overall score
  - Displays exam type name
  - Shows completion message
- **Inputs**:
  - `score: BaseScore | null`
  - `examTypeName: string`
- **Used for**: Wawancara, Seminar, Makalah, Portofolio, Praktik, Studi Kasus

### 2. Dashboard Component Updates

#### a. Removed Methods
- `getGroupedCompetencies()` - moved to `CatScoreComponent`
- `getCorrectAnswer()` - moved to `CatScoreComponent`
- `getCorrectAnswersCount()` - moved to `CatScoreComponent`
- `isExamCompleted()` - unused

#### b. Added Methods
- `getSelectedExamTypeCode(): string | null` - Returns the exam type code for the currently selected exam
- `getSelectedScore(): ScoreValue | null` - Returns the score object for the currently selected exam

#### c. Updated Imports
- Added `CatScoreComponent` and `GenericScoreComponent`
- Removed unused imports (`CATIndicatorCompetency`, `CATQuestions`, `CATScore`, `PraktikScoreComponent`)

### 3. Template Changes

#### a. Modal Implementation
Changed from hardcoded CAT display to dynamic rendering using `ngSwitch`:

```html
<app-modal [title]="'Hasil Ujian'">
    <ng-container [ngSwitch]="getSelectedExamTypeCode()">
        <!-- CAT: Competency breakdown -->
        <app-cat-score *ngSwitchCase="ExamTypeCategory.CAT" 
                       [score]="$any(getSelectedScore())"></app-cat-score>

        <!-- Other types: Simple score display -->
        <app-generic-score *ngSwitchCase="ExamTypeCategory.WAWANCARA" 
                          [score]="$any(getSelectedScore())" 
                          [examTypeName]="'Wawancara'"></app-generic-score>
        <!-- ... other exam types ... -->
    </ng-container>
</app-modal>
```

#### b. Action Buttons
Updated all exam type cards to show "Lihat Nilai" (View Score) button when score is available:

- **CAT**: Button already existed
- **Wawancara**: Changed from "Wawancara Selesai" to "Lihat Nilai"
- **Praktik**: Changed from "Praktik Selesai" to "Lihat Nilai"
- **Studi Kasus**: Changed from "Studi Kasus Selesai" to "Lihat Nilai"
- **Portofolio**: Changed from "Portofolio Terkirim" to "Lihat Nilai"
- **Seminar**: Changed from "Seminar Selesai" to "Lihat Nilai"
- **Makalah**: Now has TWO buttons:
  - "Lihat Nilai" - opens score modal
  - "Lihat File" - opens uploaded file preview

## Exam Type Support

| Exam Type | Display Component | Features |
|-----------|-------------------|----------|
| CAT | `CatScoreComponent` | Score + Competency breakdown |
| Wawancara | `GenericScoreComponent` | Score only |
| Seminar | `GenericScoreComponent` | Score only |
| Makalah | `GenericScoreComponent` | Score only |
| Portofolio | `GenericScoreComponent` | Score only |
| Praktik | `GenericScoreComponent` | Score only |
| Studi Kasus | `GenericScoreComponent` | Score only |

## Benefits

1. **Separation of Concerns**: Each score display type has its own component
2. **Maintainability**: Easier to update or enhance specific exam type displays
3. **Reusability**: Components can be used in other parts of the application
4. **Scalability**: Easy to add new exam types or customize existing ones
5. **Type Safety**: Proper TypeScript typing with appropriate casting

## Usage

To view exam scores:
1. User completes an exam
2. Score appears on the dashboard card
3. Click "Lihat Nilai" button
4. Modal opens showing appropriate score display based on exam type

## Future Enhancements

- Add more detailed scoring information for Praktik, Portofolio, and Studi Kasus
- Add export functionality for scores
- Add comparison view for multiple exam attempts
- Add visualization (charts/graphs) for CAT competencies

