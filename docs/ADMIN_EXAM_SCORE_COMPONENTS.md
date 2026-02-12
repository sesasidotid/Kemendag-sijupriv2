# Admin Exam Score Components

This directory contains reusable admin components for displaying detailed exam scores with comprehensive information including questions, answers, and performance metrics.

## Components

### 1. CatScoreAdminComponent

**Location:** `src/modules/ukom/components/cat-score-admin/`

**Purpose:** Displays detailed CAT (Computer Assisted Test) exam scores for administrators with competency and indicator breakdowns.

**Features:**
- Total score display with visual gradient design
- Competency grouping with percentage calculations
- Indicator-level performance metrics
- Question-by-question breakdown showing:
  - Participant's answer
  - Correct answer
  - Answer choices text
  - Question weight
  - Correct/Wrong status
- Summary statistics for each indicator (correct, wrong, success rate)
- Color-coded badges based on performance thresholds

**Usage:**
```typescript
import { CatScoreAdminComponent } from '@/modules/ukom/components/cat-score-admin/cat-score-admin.component'

// In component imports
@Component({
    imports: [CatScoreAdminComponent]
})

// In template
<app-cat-score-admin [score]="catScoreData"></app-cat-score-admin>
```

**Input Properties:**
- `score`: `CATScore | null` - The CAT exam score data

**Performance Thresholds:**
- Success (Green): ≥ 70%
- Warning (Yellow): 50% - 69%
- Danger (Red): < 50%

---

### 2. GenericScoreAdminComponent

**Location:** `src/modules/ukom/components/generic-score-admin/`

**Purpose:** Displays detailed scores for non-CAT exam types including Portfolio, Studi Kasus, Praktik, and Makalah.

**Features:**
- Total score display with percentage calculation
- Question-by-question listing with:
  - Question number and text
  - Question type
  - Weight
  - Score received
  - Text answers
  - File uploads with download links
  - Validation status (for Portfolio)
- Hierarchical question support (parent/child relationships)
- Summary statistics:
  - Total questions
  - Total score
  - Percentage

**Usage:**
```typescript
import { GenericScoreAdminComponent } from '@/modules/ukom/components/generic-score-admin/generic-score-admin.component'

// In component imports
@Component({
    imports: [GenericScoreAdminComponent]
})

// In template
<app-generic-score-admin 
    [score]="examScoreData" 
    [examType]="'Portfolio'">
</app-generic-score-admin>
```

**Input Properties:**
- `score`: `PortofolioScore | StudiKasusScore | PraktikScore | MakalahScore | null` - The exam score data
- `examType`: `string` - The exam type name for display (e.g., 'Portfolio', 'Studi Kasus')

**Supported Exam Types:**
- `PortofolioScore`: Shows validation status (memadai/valid)
- `StudiKasusScore`: Shows individual question scores
- `PraktikScore`: Shows hierarchical questions (parent/child)
- `MakalahScore`: Shows file uploads and basic scoring

---

## Implementation Example

### In ukom-task-detail.component.ts:

```typescript
import { CatScoreAdminComponent } from '@/modules/ukom/components/cat-score-admin/cat-score-admin.component'
import { GenericScoreAdminComponent } from '@/modules/ukom/components/generic-score-admin/generic-score-admin.component'

@Component({
    selector: 'app-ukom-task-detail',
    imports: [
        // ... other imports
        CatScoreAdminComponent,
        GenericScoreAdminComponent,
    ],
})
export class UkomTaskDetailComponent {
    selectedExamId: string | null = null
    scoreMap: Record<string, ScoreValue | null> = {}

    // Helper method to get the selected score
    getSelectedScore(): CATScore | null {
        if (!this.selectedExamId) {
            return null
        }
        return this.scoreMap[this.selectedExamId] as CATScore
    }

    // Determine exam type
    getExamType(examSchedule: any): string {
        return examSchedule.examTypeCode
    }
}
```

### In ukom-task-detail.component.html:

```html
<!-- For CAT exams -->
<app-modal *ngIf="isModalOpen$ | async" 
           [title]="'Hasil Ujian'" 
           (toggle)="toggleModal()" 
           [size]="'xl'">
    <app-cat-score-admin [score]="getSelectedScore()"></app-cat-score-admin>
</app-modal>

<!-- For other exam types -->
<app-modal *ngIf="isModalOpen$ | async" 
           [title]="'Hasil Ujian'" 
           (toggle)="toggleModal()" 
           [size]="'xl'">
    <app-generic-score-admin 
        [score]="getSelectedScore()" 
        [examType]="selectedExamType">
    </app-generic-score-admin>
</app-modal>
```

---

## Data Models

### CATScore
```typescript
{
    id: string
    examScheduleId: string
    examTypeCode: string
    roomUkomId: string
    participantId: string
    score: string | null
    questionDtoList: null
    kompetensiIndikatorDtoList: CATIndicatorCompetency[]
}
```

### CATIndicatorCompetency
```typescript
{
    id: string
    name: string
    kompetensiId: string
    kompetensiName: string
    questionDtoList: CATQuestions[]
}
```

### Generic Score Models
All share a base structure with `questionDtoList` containing question objects with:
- `id`: Question ID
- `question`: Question text
- `type`: Question type
- `weight`: Question weight
- `answerDto`: Answer object with score, text, or file upload

---

## Styling

Both components use consistent styling with:
- Gradient score display cards
- Responsive layouts
- Color-coded performance indicators
- Hover effects for better UX
- Bootstrap-compatible classes
- Material Design Icons (mdi)

---

## Benefits

### For Admins:
1. **Comprehensive View**: See complete exam details including all questions and answers
2. **Performance Analysis**: Understand participant performance at competency, indicator, and question levels
3. **Quick Identification**: Color-coded badges make it easy to spot problem areas
4. **Detailed Comparison**: View participant answers alongside correct answers
5. **File Access**: Direct access to uploaded files for review

### For Developers:
1. **Reusable**: Single component handles all CAT or generic exams
2. **Type-Safe**: Full TypeScript support with proper models
3. **Maintainable**: Centralized logic for score display
4. **Extensible**: Easy to add new features or customize appearance
5. **Consistent**: Uniform UI across different parts of the application

---

## Future Enhancements

Potential improvements:
- Export to PDF/Excel functionality
- Graphical performance charts
- Comparison with average scores
- Historical performance tracking
- Filtering and sorting options
- Print-friendly view
- Answer explanation support

---

## Migration from Old Implementation

The new components replace inline score display logic in `ukom-task-detail.component.html` and remove duplicate methods from the TypeScript file:

**Removed Methods:**
- `getGroupedCompetencies()`
- `getCorrectAnswer()`
- `getCompetencyPercentage()`
- `getCorrectAnswersCount()`
- `getWrongAnswersCount()`

**New Method:**
- `getSelectedScore()` - Returns the score for the component to display

This reduces code duplication and makes the main component cleaner and more focused on data management rather than presentation logic.
