# CAT Exam Security - Backend Requirements & Implementation Plan

## 🚨 Problem Statement

Currently, the CAT (Computer Assisted Test) exam security violations (e.g., leaving fullscreen, switching tabs) are tracked on the **client-side using `localStorage`**. This poses significant security risks:

1. **Tampering:** Users can easily clear or modify `localStorage` to reset their violation count.
2. **No Persistence:** Violation counts are lost if the user switches devices or browsers.
3. **Data Collision:** Without unique exam IDs, data from different sessions can conflict.

**Goal:** Move the "source of truth" for security violations to the **Backend Server**.

---

## 📋 Backend Requirements

### 1. Database Schema Updates

The `ExamAttendance` (or equivalent table tracking a user's specific exam session) needs new fields:

| Field Name          | Type           | Description                                                                          |
| :------------------ | :------------- | :----------------------------------------------------------------------------------- |
| `violation_count` | `Integer`    | Current number of violations committed. Default `0`.                               |
| `max_violations`  | `Integer`    | Maximum allowed violations before disqualification. Default `3` (or configurable). |
| `is_disqualified` | `Boolean`    | Flag to indicate if the user has been disqualified due to violations.                |
| `violation_logs`  | `JSON/Table` | (Optional) Log of individual violation events (timestamp, reason, user-agent).       |

### 2. API Endpoints

#### A. Report Violation Endpoint

**Description:** Increments the violation count for the given attendance record.

**Request Body:**

```json
{
  "reason": "Left Fullscreen",
  "timestamp": "2024-12-03T10:00:00Z",
  "deviceInfo": "Chrome 120.0, Windows 10" // Optional
}
```

**Logic:**

1. Fetch `ExamAttendance` by ID.
2. Increment `violation_count`.
3. Log the violation detail.
4. **Check Threshold:**
   * If `violation_count >= max_violations`:
     * Set `status` to `FINISHED` (or `DISQUALIFIED`).
5. Return the updated status.

**Response (Success):**

```json
{
  "status": "success",
  "data": {
    "violationCount": 1,
    "maxViolations": 3,
    "remainingViolations": 2,
    "examStatus": "ONGOING", // "ONGOING", "FINISHED", "DISQUALIFIED"
    "message": "Warning: Violation recorded. You have 2 attempts left."
  }
}
```

**Response (Disqualified):**

```json
{
  "status": "success",
  "data": {
    "violationCount": 3,
    "maxViolations": 3,
    "remainingViolations": 0,
    "examStatus": "DISQUALIFIED",
    "message": "Maximum violations exceeded. Your exam has been automatically submitted."
  }
}
```

#### B. Get Exam Attendance (Update Existing)

The existing endpoint used to fetch exam status must include the security state.

**Response Update:**

```json
{
  ...
  "id": "12345",
  "violationCount": 2,     // <--- NEW
  "maxViolations": 3       // <--- NEW
  ...
}
```

---

## 🗺️ Frontend Implementation Plan

### Phase 1: Preparation (Current)

* [X] Implement security detection logic (fullscreen, tab switch).
* [X] Implement UI for warnings and overlays.
* [ ] **Refactor Service:** Structure `CatExamSecurityService` to be ready for API integration (isolate the "add violation" logic).

### Phase 2: Integration (When Backend is Ready)

1. **Update Models:**

   * Update `ExamAttendance` interface in Angular to include `violationCount`.
2. **Service Integration:**

   * Modify `CatExamSecurityService.addViolation()` to call the new API endpoint.
   * Remove `localStorage` logic entirely.
3. **State Synchronization:**

   * **On Init:** Initialize `violationCount` signal from the `ExamAttendance` data fetched at startup.
   * **On Violation:** Update the local signal **only after** the server responds successfully.
4. **Handle Disqualification:**

   * If the API response returns `examStatus: 'DISQUALIFIED'`, immediately trigger the `autoSubmit` callback in the frontend to close the exam session.
5. **Offline Handling (Robustness):**

   * Implement a queue system: If the network is down when a violation occurs, store it temporarily in memory/storage and retry sending it when the connection is restored.
