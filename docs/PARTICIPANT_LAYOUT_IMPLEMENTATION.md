# Participant Exam Layout Component Implementation

## Overview
Created a reusable layout component for participant exam pages, similar to the examiner's `exam-assessment-layout` component. This refactoring eliminates code duplication and provides a consistent UI/UX across all participant exam pages.

## Changes Made

### 1. Created New Layout Component
**Location:** `src/siukom-participant/_shared/components/participant-exam-layout/`

#### Files Created:
- `participant-exam-layout.component.ts`
- `participant-exam-layout.component.html`
- `participant-exam-layout.component.scss`

#### Component Features:
The layout component provides:
- **Header Section**: Back button and saved indicator
- **Loading State**: Centered spinner with customizable message
- **Error Handling**: Modal dialog for critical errors with reload and back options
- **Content Projection**: Uses `<ng-content>` to render page-specific content

#### Component Inputs:
```typescript
loading: boolean                   // Show loading spinner
loadingMessage: string            // Loading text
showSavedIndicator: boolean       // Show success indicator
savedMessage: string              // Success message text
showBackButton: boolean           // Show back button
backButtonLabel: string           // Back button text
criticalError: boolean            // Show error modal
errorMessage: string              // Error message text
```

#### Component Outputs:
```typescript
backClicked: void                 // Emitted when back button clicked
reloadClicked: void              // Emitted when reload button clicked
```

### 2. Updated Participant Exam Pages

Updated the following components to use the new layout:

#### a. Makalah Page
- **File:** `src/siukom-participant/makalah-page/`
- **Template:** Replaced header actions and error modal with layout component
- **TypeScript:** Added `ParticipantExamLayoutComponent` to imports

#### b. Studi Kasus Page
- **File:** `src/siukom-participant/studi-kasus-page/`
- **Template:** Replaced header actions and error modal with layout component
- **TypeScript:** Added `ParticipantExamLayoutComponent` to imports

#### c. Portfolio Page
- **File:** `src/siukom-participant/portfolio-page/`
- **Template:** Replaced header actions and error modal with layout component
- **TypeScript:** Added `ParticipantExamLayoutComponent` to imports

#### d. Practical Work Page
- **File:** `src/siukom-participant/practical-work-page/`
- **Template:** Replaced header actions and error modal with layout component
- **TypeScript:** Added `ParticipantExamLayoutComponent` to imports

### 3. Template Structure

**Before (per component):**
```html
<div class="d-flex align-items-center justify-content-between mb-3">
    <button (click)="backToDashboard()" class="btn btn-outline-secondary">
        <i class="mdi mdi-chevron-left"></i> Kembali
    </button>
    <div *ngIf="!pageLoading() && hasExistingAnswer()" 
         class="alert alert-success d-flex align-items-center">
        <i class="mdi mdi-check-circle me-1"></i>
        <small>Jawaban telah disimpan</small>
    </div>
</div>

<div *ngIf="criticalError()" class="modal d-block" 
     style="background-color: rgba(0, 0, 0, 0.5)" tabindex="-1">
    <!-- Error modal content -->
</div>

<ng-container *ngIf="pageLoading(); else content">
    <!-- Loading spinner -->
</ng-container>

<ng-template #content>
    <!-- Page content -->
</ng-template>
```

**After (with layout):**
```html
<app-participant-exam-layout
    [backButtonLabel]="'Kembali'"
    [criticalError]="criticalError()"
    [errorMessage]="errorMessage()"
    [loading]="pageLoading()"
    [loadingMessage]="'Memuat soal ujian...'"
    [showBackButton]="true"
    [showSavedIndicator]="!pageLoading() && hasExistingAnswer()"
    [savedMessage]="'Jawaban telah disimpan'"
    (backClicked)="backToDashboard()"
    (reloadClicked)="reloadPage()"
>
    <!-- Page content directly here -->
</app-participant-exam-layout>
```

## Benefits

1. **Code Reusability**: Common UI elements are now centralized in one component
2. **Consistency**: All participant exam pages have the same look and feel
3. **Maintainability**: Changes to layout only need to be made in one place
4. **Reduced Code Duplication**: Eliminated ~70 lines of repetitive code per component
5. **Easier Testing**: Layout logic can be tested independently

## Comparison with Examiner Layout

### Similarities:
- Both use the same approach with inputs/outputs
- Both handle loading states and back navigation
- Both support content projection via `<ng-content>`

### Differences:

| Feature | Examiner Layout | Participant Layout |
|---------|----------------|-------------------|
| Participant Info Card | ✅ Yes | ❌ No |
| Zoom Link Integration | ✅ Yes | ❌ No |
| Error Modal | ❌ No | ✅ Yes |
| Data Fetching | ✅ Auto-fetch exam/participant | ❌ No |

The participant layout is simpler because:
- Participants don't need to see other participant's info
- Participants join zoom from their dashboard, not exam pages
- Participants need error recovery options (reload/back)

## Testing Recommendations

1. Test each exam page (makalah, studi kasus, portfolio, practical work)
2. Verify back button navigation works
3. Verify saved indicator shows when appropriate
4. Verify error modal displays correctly
5. Verify loading state displays correctly
6. Verify reload button works in error modal

## Build Status

✅ **Build Successful**
- No compilation errors
- All components properly imported
- All templates properly updated

