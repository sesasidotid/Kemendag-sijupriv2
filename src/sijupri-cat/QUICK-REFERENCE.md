# CAT Page - Quick Reference Guide

## 📋 Quick Stats
- **Component Size**: 536 → 315 lines (41% reduction)
- **New Services**: 3
- **New Directives**: 3
- **New Guards**: 1
- **Documentation Files**: 3

## 🚀 Quick Start

### Using the Security Service
```typescript
import { CatExamSecurityService } from '../services/cat-exam-security.service'

// In component
private securityService = inject(CatExamSecurityService)

// Initialize
this.securityService.initializeSecurity(() => this.submitExam())

// Access reactive data
this.violationCount = this.securityService.violationCount
this.showWarning = this.securityService.showWarning

// Cleanup
this.securityService.cleanup()
```

### Using the Timer Service
```typescript
import { CatExamTimerService } from '../services/cat-exam-timer.service'

// In component
private timerService = inject(CatExamTimerService)

// Start timer
this.timerService.startCountdown(
    examEndTime,      // Date
    startAt,          // string
    duration,         // number (hours)
    () => this.submitExam()  // callback
)

// Access reactive data
this.remainingTime = this.timerService.remainingTime
this.remainingSeconds = this.timerService.remainingSeconds

// Cleanup
this.timerService.cleanup()
```

### Using the Answer Service
```typescript
import { CatAnswerService } from '../services/cat-answer.service'

// In component
private answerService = inject(CatAnswerService)

// Load questions
this.answerService.loadQuestions(roomUkomId).subscribe()

// Navigate
this.answerService.navigateToPage(pageNumber)

// Select answer
this.answerService.selectAnswer(questionId, choiceId)

// Save answer
this.answerService.saveAnswer(questionId, participantId).subscribe()

// Submit exam
this.answerService.submitExam(examType, roomId, openDialog).subscribe()

// Access reactive data
this.currentPage = this.answerService.currentPage
this.selectedAnswer = this.answerService.selectedAnswer
```

### Using Directives in Template
```html
<!-- Apply all security directives -->
<div class="exam-container"
     appDisableRightClick
     appDisableKeyboardShortcuts
     appFullscreenEnforcement>
    
    <!-- Exam content here -->
</div>
```

### Using the Guard in Routes
```typescript
import { catExamGuard } from './guards/cat-exam.guard'

{
    path: 'cat',
    component: CatPageComponent,
    canActivate: [authGuard, catExamGuard]
}
```

## 📁 File Locations

```
sijupri-cat/
├── services/
│   ├── cat-exam-security.service.ts
│   ├── cat-exam-timer.service.ts
│   ├── cat-answer.service.ts
│   └── index.ts
├── directives/
│   ├── disable-right-click.directive.ts
│   ├── disable-keyboard-shortcuts.directive.ts
│   ├── fullscreen-enforcement.directive.ts
│   └── index.ts
├── guards/
│   ├── cat-exam.guard.ts
│   └── index.ts
└── cat-page/
    ├── cat-page.component.ts
    ├── cat-page.component.html
    └── cat-page.component.scss
```

## 🔍 Common Tasks

### Add a new security feature
1. Open `cat-exam-security.service.ts`
2. Add your method
3. Expose signal if needed
4. Use in component

### Modify timer behavior
1. Open `cat-exam-timer.service.ts`
2. Update timer logic
3. No changes needed in component

### Change answer saving logic
1. Open `cat-answer.service.ts`
2. Modify save/submit methods
3. Component automatically uses new logic

### Add a new directive
1. Create in `directives/` folder
2. Export from `index.ts`
3. Import in component
4. Apply in template

## ⚡ Important Signal Syntax

In templates, signals require `()`:

```html
<!-- ❌ Wrong -->
<div>{{ currentPage }}</div>
<div>{{ remainingTime }}</div>

<!-- ✅ Correct -->
<div>{{ currentPage() }}</div>
<div>{{ remainingTime() }}</div>
```

## 🧪 Testing

### Test a Service
```typescript
describe('CatExamSecurityService', () => {
    let service: CatExamSecurityService

    beforeEach(() => {
        service = TestBed.inject(CatExamSecurityService)
    })

    it('should add violation', () => {
        const before = service.violationCount()
        service.handleVisibilityChange()
        expect(service.violationCount()).toBe(before + 1)
    })
})
```

### Test a Directive
```typescript
@Component({
    template: '<div appDisableRightClick></div>'
})
class TestComponent {}

describe('DisableRightClickDirective', () => {
    it('should prevent context menu', () => {
        // Test implementation
    })
})
```

## 🐛 Troubleshooting

### Signal not updating?
- Ensure you're calling the signal with `()`
- Check that service is properly injected

### Directive not working?
- Verify directive is imported in component
- Check selector in template matches directive selector

### Guard not protecting route?
- Ensure guard is in `canActivate` array
- Check guard logic returns true/false/Observable

## 📚 Documentation Files

1. **ARCHITECTURE.md** - Visual architecture diagram
2. **CAT-REFACTORING-README.md** - Detailed refactoring guide
3. **CAT-REFACTORING-SUMMARY.md** - Summary and metrics
4. **QUICK-REFERENCE.md** - This file

## 🎯 Best Practices

1. **Always cleanup** - Call `cleanup()` in `ngOnDestroy`
2. **Use signals** - For reactive state management
3. **Delegate to services** - Component only orchestrates
4. **Apply directives** - For reusable behaviors
5. **Protect routes** - Use guards for security

## ✅ Checklist for New Features

- [ ] Identify which service handles the logic
- [ ] Add method to appropriate service
- [ ] Expose signal if state is needed
- [ ] Use in component via delegation
- [ ] Update template if needed
- [ ] Add tests
- [ ] Update documentation

## 🔗 Related Files

- Original component: `cat-page.component.ts` (was 536 lines)
- Refactored component: `cat-page.component.ts` (now 315 lines)
- Routes: `sijupri-cat.routes.ts`
- Base services: `modules/base/services/`
- Ukom services: `modules/ukom/services/`

---

**Need more details?** See:
- `ARCHITECTURE.md` for architecture diagrams
- `CAT-REFACTORING-README.md` for comprehensive guide
- `CAT-REFACTORING-SUMMARY.md` for metrics and benefits
