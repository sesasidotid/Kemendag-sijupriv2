# CAT Page Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAT PAGE ARCHITECTURE                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           ROUTE PROTECTION LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Route: /cat                                                               │
│      ↓                                                                       │
│   Guards: [authGuard, catExamGuard]                                        │
│      ↓                                                                       │
│   ✓ Validates user authentication                                          │
│   ✓ Validates participant registration                                     │
│   ✓ Validates exam schedule                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   CatPageComponent (cat-page.component.ts)                                 │
│   ┌──────────────────────────────────────────────────────────────┐        │
│   │  Responsibilities:                                            │        │
│   │  • UI Orchestration                                          │        │
│   │  • User interaction handling                                 │        │
│   │  • Service coordination                                      │        │
│   │  • Template data binding                                     │        │
│   │                                                               │        │
│   │  Properties (Reactive):                                      │        │
│   │  • currentPage()         - from answerService               │        │
│   │  • remainingTime()       - from timerService                │        │
│   │  • violationCount()      - from securityService             │        │
│   │  • selectedAnswer()      - from answerService               │        │
│   │                                                               │        │
│   │  Methods (Delegation):                                       │        │
│   │  • navigateToPage()      → answerService.navigateToPage()   │        │
│   │  • selectAnswer()        → answerService.selectAnswer()     │        │
│   │  • submitAnswer()        → answerService.submitExam()       │        │
│   └──────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         ↓               ↓               ↓               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DIRECTIVE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│   │ DisableRightClick│  │DisableKeyboard   │  │Fullscreen        │       │
│   │ Directive        │  │Shortcuts         │  │Enforcement       │       │
│   │                  │  │Directive         │  │Directive         │       │
│   ├──────────────────┤  ├──────────────────┤  ├──────────────────┤       │
│   │ • Prevents      │  │ • Blocks Ctrl+C  │  │ • Enforces       │       │
│   │   context menu  │  │ • Blocks Ctrl+V  │  │   fullscreen     │       │
│   │                 │  │ • Blocks F12     │  │ • Re-enters on   │       │
│   │                 │  │ • Blocks Ctrl+A  │  │   exit           │       │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘       │
│                                                                              │
│   Applied to template:                                                      │
│   <div appDisableRightClick                                                │
│        appDisableKeyboardShortcuts                                         │
│        appFullscreenEnforcement>                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
         ↓               ↓               ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  CatExamSecurityService                                        │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │  Responsibilities:                                              │        │
│  │  • Fullscreen enforcement                                      │        │
│  │  • Tab/window switching detection                              │        │
│  │  • DevTools detection                                          │        │
│  │  • Mouse tracking outside exam area                            │        │
│  │  • Violation counting & threshold management                   │        │
│  │  • Auto-submit on violation limits                             │        │
│  │                                                                 │        │
│  │  Signals:                                                       │        │
│  │  • violationCount                                              │        │
│  │  • showWarning                                                 │        │
│  │                                                                 │        │
│  │  Methods:                                                       │        │
│  │  • initializeSecurity()                                        │        │
│  │  • handleVisibilityChange()                                    │        │
│  │  • handleMouseMove()                                           │        │
│  │  • enterFullScreen()                                           │        │
│  │  • clearViolations()                                           │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  CatExamTimerService                                           │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │  Responsibilities:                                              │        │
│  │  • Countdown timer management                                  │        │
│  │  • Time calculation & formatting                               │        │
│  │  • Auto-submit on time expiration                              │        │
│  │  • Warning indicators                                           │        │
│  │                                                                 │        │
│  │  Signals:                                                       │        │
│  │  • remainingTime                                               │        │
│  │  • remainingSeconds                                            │        │
│  │                                                                 │        │
│  │  Methods:                                                       │        │
│  │  • startCountdown()                                            │        │
│  │  • stopCountdown()                                             │        │
│  │  • formatTime()                                                │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  CatAnswerService                                              │        │
│  ├────────────────────────────────────────────────────────────────┤        │
│  │  Responsibilities:                                              │        │
│  │  • Question loading & tracking                                 │        │
│  │  • Answer selection & storage                                  │        │
│  │  • Answer saving to backend                                    │        │
│  │  • Question navigation                                         │        │
│  │  • Exam submission                                             │        │
│  │                                                                 │        │
│  │  Signals:                                                       │        │
│  │  • currentPage                                                 │        │
│  │  • totalQuestions                                              │        │
│  │  • selectedAnswer                                              │        │
│  │  • savedAnswer                                                 │        │
│  │                                                                 │        │
│  │  Methods:                                                       │        │
│  │  • loadQuestions()                                             │        │
│  │  • navigateToPage()                                            │        │
│  │  • selectAnswer()                                              │        │
│  │  • saveAnswer()                                                │        │
│  │  • submitExam()                                                │        │
│  │  • saveAndSubmitExam()                                         │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA ACCESS LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ApiService                                                                │
│   ├─ GET  /api/v1/exam/page/CAT/{roomId}                                  │
│   ├─ POST /api/v1/exam/answer                                              │
│   ├─ POST /api/v1/exam/finish                                              │
│   ├─ GET  /api/v1/exam_attendance/{type}/{roomId}/{participantId}         │
│   └─ ...                                                                    │
│                                                                              │
│   CatService                                                                │
│   ├─ parseServerDate()                                                     │
│   ├─ getExamAttendance()                                                   │
│   ├─ violationCount (shared signal)                                        │
│   └─ ...                                                                    │
│                                                                              │
│   UkomParticipantService                                                   │
│   ├─ getParticipantUkom()                                                  │
│   └─ ...                                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW DIAGRAM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

USER ACTION                    COMPONENT              SERVICE              BACKEND
    │                              │                     │                    │
    ├─ Click "Simpan" ────────────>│                     │                    │
    │                              ├─ onSaveButtonClick()│                    │
    │                              │                     │                    │
    │                              ├─────────────────────>│                    │
    │                              │  saveAnswer(id)     │                    │
    │                              │                     │                    │
    │                              │                     ├────────────────────>│
    │                              │                     │  POST /exam/answer │
    │                              │                     │                    │
    │                              │                     │<────────────────────┤
    │                              │                     │  Response          │
    │                              │                     │                    │
    │                              │<─────────────────────┤                    │
    │                              │  Observable result  │                    │
    │                              │                     │                    │
    │<─ UI Update (next question) ─┤                     │                    │
    │                              │                     │                    │
    │                              │                     │                    │
    ├─ Switch Tab ────────────────>│                     │                    │
    │                              ├─ @HostListener      │                    │
    │                              │   visibilitychange  │                    │
    │                              │                     │                    │
    │                              ├─────────────────────>│                    │
    │                              │  handleVisibility   │                    │
    │                              │  Change()           │                    │
    │                              │                     │                    │
    │                              │                     ├─ addViolation()    │
    │                              │                     ├─ Check threshold   │
    │                              │                     │                    │
    │                              │<─────────────────────┤                    │
    │                              │  violationCount     │                    │
    │                              │  updated            │                    │
    │<─ Alert shown ───────────────┤                     │                    │
    │                              │                     │                    │

┌─────────────────────────────────────────────────────────────────────────────┐
│                           KEY BENEFITS                                       │
└─────────────────────────────────────────────────────────────────────────────┘

✅ SINGLE RESPONSIBILITY
   Each service handles one specific concern

✅ TESTABILITY
   Services can be unit tested independently

✅ REUSABILITY
   Directives and services can be used in other components

✅ MAINTAINABILITY
   Changes are isolated to specific services

✅ SCALABILITY
   Easy to add new features without modifying existing code

✅ TYPE SAFETY
   Full TypeScript typing throughout

✅ REACTIVE
   Signals provide automatic updates to the UI
