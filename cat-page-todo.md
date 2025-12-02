
# Computer-Assisted Test (CAT) Website Security & Features Checklist

## 1. Security / Anti-Cheating Measures

| Feature                      | Description                                | Frontend                            | Backend                           | Notes                                            |
| ---------------------------- | ------------------------------------------ | ----------------------------------- | --------------------------------- | ------------------------------------------------ |
| Tab/Window Detection         | Detect if user switches tabs or windows    | ✅`visibilitychange`              | ⚠ Optional logging               | Warn user or auto-submit after repeated offenses |
| Fullscreen Mode              | Force test in full-screen                  | ✅`requestFullscreen`             | ⚠ Log events                     | Detect exit with `fullscreenchange`            |
| Right-click / Copy-Paste     | Disable context menu and clipboard actions | ✅`contextmenu`,`keydown`       | ⚠ Optional logging               | Can’t fully prevent advanced users              |
| Text Selection               | Prevent selecting/copying text             | ✅ CSS `user-select: none`        | ❌                                | Visual deterrent only                            |
| Keyboard Monitoring          | Detect shortcuts (Ctrl+C, Ctrl+V, Ctrl+X)  | ✅ JS `keydown`                   | ⚠ Log events                     | Can flag suspicious behavior                     |
| Detect DevTools / Inspect    | Detect if user opens browser inspect tools | ✅ JS detection, alert, or redirect | ⚠ Optional logging               | Cannot fully prevent, only make inconvenient     |
| One Session Per User         | Prevent multiple logins at same time       | ❌                                  | ✅                                | Backend validates session tokens                 |
| Time Limit Enforcement       | Auto-submit after time expires             | ✅ Show countdown                   | ✅ Final enforcement              | Never rely on frontend only                      |
| Answer Auto-Save             | Save answers in real-time                  | ✅ via API                          | ✅ persist to DB                  | Prevent data loss on refresh/accidental close    |
| Secure Question Delivery     | Serve questions only per session           | ❌                                  | ✅                                | Avoid sending full test to frontend at once      |
| HTTPS / Secure API           | Encrypt communication                      | ❌                                  | ✅                                | Mandatory for all test data                      |
| Logging / Audit Trail        | Track activity, IP, timestamps             | ✅ send events                      | ✅ store in DB                    | For post-test review / cheating detection        |
| Optional Webcam / Proctoring | Detect multiple faces or monitors          | ✅ via webcam API                   | ✅ analyze or send data to server | Requires user consent; increases security        |

## 2. Test-Taking Features / UX

| Feature                   | Description                                   | Frontend | Backend             | Notes                               |
| ------------------------- | --------------------------------------------- | -------- | ------------------- | ----------------------------------- |
| Flag Question for Review  | User can mark uncertain questions             | ✅       | ✅ save flag        | Highlight in navigation panel       |
| Question Navigation Panel | Jump to answered/unanswered/flagged questions | ✅       | ⚠ Optional         | Improves usability                  |
| Answer Persistence        | Maintain answers on refresh                   | ✅       | ✅ save to DB       | Works with auto-save                |
| Timer Display             | Global / per-question timers                  | ✅       | ✅ enforce          | Auto-submit server-side             |
| Keyboard Shortcuts        | Next/Prev/Mark question                       | ✅       | ❌                  | Optional but improves accessibility |
| Responsive UI             | Works on allowed devices                      | ✅       | ❌                  | Ensure no cheating via hidden views |
| Confirmation on Submit    | Prevent accidental submission                 | ✅       | ✅ final validation | Optional extra safety               |

## 3. Frontend vs Backend Responsibilities

| Responsibility             | Frontend             | Backend                   |
| -------------------------- | -------------------- | ------------------------- |
| Detect tab/window changes  | ✅                   | ⚠ log events             |
| Fullscreen enforcement     | ✅                   | ⚠ log exit events        |
| Prevent right-click / copy | ✅                   | ⚠ optional logging       |
| Detect DevTools / Inspect  | ✅ detection & alert | ⚠ log events             |
| Show questions & options   | ✅                   | ✅ controlled per session |
| Auto-save answers          | ✅ send              | ✅ persist & validate     |
| Timer countdown            | ✅ display           | ✅ enforce & auto-submit  |
| Session validation         | ❌                   | ✅ enforce single session |
| Answer submission          | ✅                   | ✅ validate, save, grade  |
| Logging user activity      | ✅ send events       | ✅ store in DB & audit    |

## 4. Implementation Notes / Recommendations

### Client-Side

* Use React + Vite for SPA.
* Wrap test in a component that:
  * Requests full-screen on start.
  * Listens to `visibilitychange` and `fullscreenchange`.
  * Disables right-click, text selection, and clipboard shortcuts.
  * Detects DevTools / inspect and optionally warns or disables test input.
* Auto-save answers via API every few seconds.
* Show flagged questions in a sidebar with color-coded status.

### Server-Side

* Serve questions  **per session** ; do not send full test at once.
* Enforce timers and session validity.
* Validate all submissions (answers, flags, question IDs).
* Log every suspicious activity (tab switch, fullscreen exit, repeated copy attempts, DevTools detection).

### Database

* Tables for:
  * Users & sessions
  * Test answers & flags
  * Activity logs (timestamps, IP, events)
  * Question metadata (to support randomization)
* Store logs for post-test auditing.

### Optional Advanced Security

* Randomize question order per user.
* Shuffle answer options per user.
* Use AI proctoring for face detection, eye-tracking.
* Restrict IP or device for each test session.

---

**Summary:**

* **Frontend:** handles UX, auto-save, tab/fullscreen detection, DevTools detection, minor anti-cheating.
* **Backend:** enforces security, validates answers, logs activity.
* **Both:** session management and logging.
