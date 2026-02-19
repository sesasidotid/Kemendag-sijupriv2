# Participant Dropdown Bug Fix

## Issue Description
The participant dropdown was showing "undefined (undefined)" instead of displaying participant names and NIPs correctly. The dropdown was showing the correct count (e.g., 2 participants) but not the actual data.

## Root Cause
The API endpoint `/api/v1/participant_ukom/room/{roomUkomId}` returns an array of `RoomParticipant[]` objects with a nested structure:

```typescript
RoomParticipant {
  id: string
  participantId: string
  roomId: string
  participantUkom: {
    id: string
    name: string
    nip: string
    email: string
    // ...other fields
  }
}
```

However, the code was trying to access properties directly on the root level:
```typescript
// ❌ WRONG - accessing properties that don't exist
participants.map((p) => ({
  id: p.id,              // This is RoomParticipant.id, not participant's id
  label: `${p.name} (${p.nip})`  // p.name and p.nip don't exist!
}))
```

## Solution
Fixed the mapping to access the nested `participantUkom` properties:

```typescript
// ✅ CORRECT - accessing nested properties
participants.map((p) => ({
  id: p.participantUkom?.id,
  label: `${p.participantUkom?.name} (${p.participantUkom?.nip})`
}))
```

## Files Changed

### 1. Service Type Update
**File:** `/modules/ukom/services/participant.service.ts`

**Changes:**
- Added `RoomParticipant` import
- Updated `getParticipantListByRoomUkomId()` return type from `Observable<Participant[]>` to `Observable<RoomParticipant[]>` for type accuracy

### 2. Schedule Add Component
**File:** `/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-schedule-add/ukom-exam-schedule-add.component.ts`

**Changes:**
- Added `RoomParticipant` import
- Fixed `getParticipantListOptions()` to access nested `participantUkom` properties:
  ```typescript
  map((participants: RoomParticipant[]) =>
    participants.map((p) => ({
      id: p.participantUkom?.id,
      label: `${p.participantUkom?.name} (${p.participantUkom?.nip})`,
    })),
  )
  ```

### 3. Schedule Update Component
**File:** `/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-schedule-update/ukom-exam-schedule-update.component.ts`

**Changes:**
- Added `RoomParticipant` import
- Removed unused imports (`UkomExaminerService`, `MultiSelectApiComponent`, `MultiSelectApiParams`)
- Removed unused fields (`examinerService`, `selectedExaminers`)
- Fixed `getParticipantListOptions()` with same nested property access as add component

## Verification
✅ TypeScript compilation successful
✅ No type errors
✅ Consistent with other components that use the same API (e.g., `ukom-class-detail` component uses `participantUkom|name` pattern in pagable)

## Impact Check
Only these two methods use `getParticipantListByRoomUkomId()`:
1. ✅ Schedule Add Component - **FIXED**
2. ✅ Schedule Update Component - **FIXED**

No other components are affected by this bug.

## Expected Result
Participant dropdown will now correctly display:
- "John Doe (123456789)"
- "Jane Smith (987654321)"

Instead of:
- "undefined (undefined)"
- "undefined (undefined)"

## Related Documentation
This fix is part of the larger examiner management migration documented in `/docs/EXAMINER_CLASS_MIGRATION.md`

