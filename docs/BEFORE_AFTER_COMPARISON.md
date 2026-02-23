# Before & After Comparison

## Flow Diagram

### BEFORE - Loop by Exam Type
```
┌─────────────────────────────────────────┐
│ getAllScoresFlow(key)                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ getExamType() - Fetch all exam types    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Loop: examType.code                     │
│ ('CAT', 'MAKALAH', 'PORTOFOLIO', ...)   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ API: /exam_grade/{examCode}?key=XXX     │
│ Examples:                               │
│  - /exam_grade/CAT?key=XXX              │
│  - /exam_grade/MAKALAH?key=XXX          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ scoreMap Structure:                     │
│ {                                       │
│   'CAT': CATScore,                      │
│   'MAKALAH': MakalahScore               │
│ }                                       │
└─────────────────────────────────────────┘
```

### AFTER - Loop by Exam Schedule
```
┌─────────────────────────────────────────┐
│ getAllScoresFlow(key)                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ Loop: finishTask.examSchedule[]         │
│ Each schedule has:                      │
│  - id (UUID)                            │
│  - examTypeCode ('CAT', 'MAKALAH', ...) │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ API: /exam_grade/{scheduleId}?key=XXX   │
│ Examples:                               │
│  - /exam_grade/abc-123-def?key=XXX      │
│  - /exam_grade/xyz-456-ghi?key=XXX      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ scoreMap Structure:                     │
│ {                                       │
│   'abc-123-def': CATScore,              │
│   'xyz-456-ghi': MakalahScore           │
│ }                                       │
└─────────────────────────────────────────┘
```

## Code Comparison

### TypeScript - getAllScoresFlow()

#### BEFORE
```typescript
getAllScoresFlow(key: string): void {
    this.getExamType()
        .pipe(
            switchMap((examTypes: ExamType[]) => {
                const requests = examTypes.map((type) => {
                    const examCode = type.code
                    return this.apiService
                        .getData(`/api/v1/exam_grade/${examCode}?key=${key}`)
                        .pipe(
                            map((response) => {
                                let scoreInstance: any
                                switch (examCode) {
                                    case 'CAT':
                                        scoreInstance = new CATScore(response)
                                        break
                                    // ...
                                }
                                return { examCode, scoreInstance }
                            })
                        )
                })
                return forkJoin(requests)
            }),
            tap((results) => {
                results.forEach((result) => {
                    this.scoreMap[result.examCode] = result.scoreInstance
                })
            })
        )
        .subscribe()
}
```

#### AFTER
```typescript
getAllScoresFlow(key: string): void {
    if (!this.finishTask.examSchedule?.length) {
        console.warn('No exam schedules available')
        return
    }

    const requests = this.finishTask.examSchedule.map((examSchedule) => {
        return this.apiService
            .getData(`/api/v1/exam_grade/${examSchedule.id}?key=${key}`)
            .pipe(
                map((response) => {
                    let scoreInstance: any = null
                    if (response) {
                        switch (examSchedule.examTypeCode) {
                            case 'CAT':
                                scoreInstance = new CATScore(response)
                                break
                            // ...
                        }
                    }
                    return { examSchedule, scoreInstance }
                })
            )
    })

    forkJoin(requests)
        .pipe(
            tap((results) => {
                results.forEach((result) => {
                    if (result?.examSchedule?.id) {
                        this.scoreMap[result.examSchedule.id] = result.scoreInstance
                    }
                })
            })
        )
        .subscribe()
}
```

### HTML Template - Score Display

#### BEFORE
```html
<ng-container *ngIf="scoreMap | keyvalue as entries">
    <div *ngIf="entries.length > 0" class="card">
        <div class="list-group">
            <div *ngIf="scoreMap['CAT']?.id">
                <h5>CAT</h5>
                <button (click)="toggleCATModal()">
                    Lihat Nilai
                </button>
            </div>

            <div *ngIf="scoreMap['MAKALAH']?.id">
                <h5>Makalah</h5>
                <button (click)="viewFile()">
                    Lihat Makalah
                </button>
            </div>
        </div>
    </div>
</ng-container>
```

#### AFTER
```html
<div *ngIf="(scoreMap | keyvalue)?.length > 0 && hasNonNullScores()" class="card">
    <div class="list-group">
        <ng-container *ngFor="let examSchedule of finishTask.examSchedule">
            <!-- CAT Score -->
            <div *ngIf="scoreMap[examSchedule.id] != null && 
                        examSchedule.examTypeCode === ExamTypeCategory.CAT">
                <h5>CAT</h5>
                <button (click)="toggleCATModal(examSchedule.id)">
                    Lihat Nilai
                </button>
            </div>

            <!-- Makalah Score -->
            <div *ngIf="scoreMap[examSchedule.id] != null && 
                        examSchedule.examTypeCode === ExamTypeCategory.MAKALAH">
                <h5>Makalah</h5>
                <button (click)="viewFile(examSchedule.id)">
                    Lihat Makalah
                </button>
            </div>

            <!-- Other/Generic Scores -->
            <div *ngIf="scoreMap[examSchedule.id] != null && 
                        examSchedule.examTypeCode !== ExamTypeCategory.CAT && 
                        examSchedule.examTypeCode !== ExamTypeCategory.MAKALAH">
                <h5>{{ examSchedule.examTypeCode }}</h5>
                <button (click)="toggleCATModal(examSchedule.id)">
                    Lihat Nilai
                </button>
            </div>
        </ng-container>
    </div>
</div>
```

### HTML Template - Modal Content

#### BEFORE
```html
<app-modal *ngIf="isCATModalOpen$ | async">
    <div class="total-score-container">
        <div class="total-score-value">
            {{ scoreMap['CAT']?.score | number: '1.2-2' }}
        </div>
    </div>

    <div *ngFor="let competencyGroup of getGroupedCompetencies()">
        <div class="card">
            <h4>{{ competencyGroup.name }}</h4>
            <span>{{ competencyGroup.percentage }}%</span>
        </div>
    </div>
</app-modal>
```

#### AFTER
```html
<app-modal *ngIf="isCATModalOpen$ | async">
    <ng-container *ngIf="getSelectedScore() as selectedScore">
        <!-- CAT Score Component -->
        <app-cat-score 
            *ngIf="selectedScore.kompetensiIndikatorDtoList"
            [score]="selectedScore">
        </app-cat-score>

        <!-- Generic Score Component -->
        <app-generic-score
            *ngIf="!selectedScore.kompetensiIndikatorDtoList"
            [score]="selectedScore">
        </app-generic-score>
    </ng-container>
</app-modal>
```

## Key Differences Summary

| Aspect | BEFORE | AFTER |
|--------|--------|-------|
| **Loop Source** | All exam types | finishTask.examSchedule |
| **API Endpoint** | /exam_grade/{examCode} | /exam_grade/{examScheduleId} |
| **scoreMap Keys** | Exam type codes ('CAT', 'MAKALAH') | Exam schedule UUIDs |
| **Score Display** | Static checks per type | Dynamic loop through schedules |
| **Modal Content** | Custom inline implementation | Reusable components |
| **Supports Multiple Same Type** | ❌ No | ✅ Yes |
| **Generic Exam Types** | ❌ No | ✅ Yes |

## Benefits of New Approach

✅ **More Accurate** - Gets scores for actual scheduled exams
✅ **More Flexible** - Supports multiple exams of same type
✅ **More Extensible** - Easy to add new exam types
✅ **More Maintainable** - Uses reusable components
✅ **Consistent** - Matches admin component pattern
✅ **Better UX** - Shows all exam results separately

