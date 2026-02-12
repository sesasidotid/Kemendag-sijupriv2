# Schedule Slot Generation Bug Fix

## Problem Statement

The slot generation algorithm was skipping valid time slots before lunch break (12:00-13:00) when the main schedule started during unavailable hours.

### Example Scenario
- Main schedule: 06:00 - 18:00 on Feb 6, 2026
- Exam duration: 2 hours
- Participant scheduled at: 08:00
- **Bug:** Slot generation jumped directly to 13:00, skipping valid slots at 08:00-10:00 and 10:00-12:00

## Root Cause Analysis

### The Bug Location
File: `src/modules/ukom/services/schedule-slot.service.ts`
Method: `getNextAvailableTimeAfterBreak()`

### Original Faulty Logic
```typescript
// INCORRECT: Jumps to 13:00 for ANY hour < 13
if (hour < this.MIDDAY_UNAVAILABLE_END_HOUR) {
    const nextTime = new Date(currentTime)
    nextTime.setUTCHours(this.MIDDAY_UNAVAILABLE_END_HOUR, 0, 0, 0)
    return nextTime
}
```

### Why It Failed
When the main schedule started at 06:00:
1. First slot: 06:00 → 08:00
2. `isSlotInUnavailableHours(06:00, 08:00)` → **true** (starts during night break)
3. `getNextAvailableTimeAfterBreak(06:00)` is called
4. `hour = 6` which is `< 13`, so it jumped to **13:00** ❌
5. This skipped all valid morning slots (08:00-10:00, 10:00-12:00)

### The Logic Error
The method confused TWO different unavailable periods:
- **Night break:** 17:00 - 08:00 → Should jump to 08:00
- **Lunch break:** 12:00 - 13:00 → Should jump to 13:00

The condition `hour < 13` incorrectly treated hours 0-12 as "lunch break", when actually:
- Hours 0-7 (00:00-07:59) are NIGHT break → jump to 08:00
- Hours 8-11 (08:00-11:59) are AVAILABLE → no jump needed
- Hours 12 (12:00-12:59) are LUNCH break → jump to 13:00

## The Fix

### Corrected Logic
```typescript
// CORRECT: Only jumps to 13:00 if currently IN lunch break (12:00-13:00)
if (
    hour >= this.MIDDAY_UNAVAILABLE_START_HOUR &&
    hour < this.MIDDAY_UNAVAILABLE_END_HOUR
) {
    const nextTime = new Date(currentTime)
    nextTime.setUTCHours(this.MIDDAY_UNAVAILABLE_END_HOUR, 0, 0, 0)
    return nextTime
}
```

### How It Works Now
The method now correctly identifies which unavailable period the slot overlaps:

1. **Lunch break detection (12:00-13:00):**
   - `hour >= 12 && hour < 13` → Jump to 13:00

2. **Night break detection (17:00-08:00):**
   - `hour >= 17 || hour < 8` → Jump to 08:00 (same/next day)

3. **Available hours (08:00-12:00, 13:00-17:00):**
   - Return current time (no jump needed)

## Verification Scenarios

### Scenario 1: Main schedule starts at 06:00
**Before fix:**
- 06:00 → jumped to 13:00 ❌
- Generated slots: [13:00-15:00, 15:00-17:00]
- Missed: [08:00-10:00, 10:00-12:00]

**After fix:**
- 06:00 → jumps to 08:00 ✅
- Generated slots: [08:00-10:00, 10:00-12:00, 13:00-15:00, 15:00-17:00]

### Scenario 2: Slot ends exactly at 12:00
**Slot: 10:00 - 12:00**
- Does not overlap lunch (12:00-13:00) ✅
- Should be generated ✅
- **Verified:** `isSlotInMiddayUnavailableHours(10:00, 12:00)` returns `false`

### Scenario 3: Slot overlaps lunch
**Slot: 11:00 - 13:00**
- Overlaps lunch period ✅
- Should be skipped ✅
- **Verified:** `isSlotInMiddayUnavailableHours(11:00, 13:00)` returns `true`
- Jumps to 13:00 ✅

### Scenario 4: Slot starts at 12:30
**Slot: 12:30 - 14:30**
- Starts during lunch break ✅
- Should be skipped ✅
- `hour = 12` triggers lunch break condition
- Jumps to 13:00 ✅

### Scenario 5: Main schedule starts at 18:00
**Before/After:** Both correct
- 18:00 → jumps to next day 08:00 ✅
- `hour = 18 >= 17` triggers night break condition

### Scenario 6: Main schedule starts at 08:00
**Before/After:** Both correct
- 08:00 is available ✅
- No jump needed ✅
- Starts generating slots from 08:00

## Business Rules Preserved

All existing business rules remain intact:
✅ Weekends (Saturday & Sunday) are unavailable
✅ Lunch break (12:00-13:00) is unavailable
✅ Night break (17:00-08:00) is unavailable
✅ Slots overlapping these periods are skipped
✅ Slot duration is fixed per schedule
✅ No browser timezone conversion (all UTC+7)

## Implementation Details

### Files Modified
- `src/modules/ukom/services/schedule-slot.service.ts`

### Lines Changed
- Line 270: Changed condition from `if (hour < this.MIDDAY_UNAVAILABLE_END_HOUR)` to `if (hour >= this.MIDDAY_UNAVAILABLE_START_HOUR && hour < this.MIDDAY_UNAVAILABLE_END_HOUR)`
- Updated comment from "If in or before lunch break" to "If in lunch break"

### Constants Used
- `MIDDAY_UNAVAILABLE_START_HOUR = 12`
- `MIDDAY_UNAVAILABLE_END_HOUR = 13`
- `UNAVAILABLE_START_HOUR = 17`
- `UNAVAILABLE_END_HOUR = 8`

## Testing Recommendations

### Unit Tests to Add
```typescript
describe('getNextAvailableTimeAfterBreak', () => {
  it('should jump to 08:00 when current time is 06:00 (night break)', () => {
    const result = service['getNextAvailableTimeAfterBreak'](new Date('2026-02-06T06:00:00Z'))
    expect(result.getUTCHours()).toBe(8)
  })

  it('should jump to 13:00 when current time is 12:00 (lunch break)', () => {
    const result = service['getNextAvailableTimeAfterBreak'](new Date('2026-02-06T12:00:00Z'))
    expect(result.getUTCHours()).toBe(13)
  })

  it('should not jump when current time is 09:00 (available)', () => {
    const input = new Date('2026-02-06T09:00:00Z')
    const result = service['getNextAvailableTimeAfterBreak'](input)
    expect(result.getTime()).toBe(input.getTime())
  })
})

describe('generateAllSlots', () => {
  it('should generate morning slots when schedule starts at 06:00', () => {
    const mainSchedule = {
      startTime: new Date('2026-02-06T06:00:00Z'),
      endTime: new Date('2026-02-06T18:00:00Z'),
      duration: 2,
      participantScheduleList: []
    }
    
    const slots = service.generateAllSlots(mainSchedule)
    
    // Should include 08:00-10:00 and 10:00-12:00
    expect(slots.some(s => s.startTime.getUTCHours() === 8)).toBe(true)
    expect(slots.some(s => s.startTime.getUTCHours() === 10)).toBe(true)
  })
})
```

## Assumptions Made

1. **Timezone consistency:** All Date objects are treated as UTC+7 without conversion
2. **Fixed duration:** Exam duration is consistent for all slots in a schedule
3. **Break boundaries:** Slots ending exactly at break start times (e.g., 12:00) are valid
4. **Break precedence:** Night break takes priority over lunch break when hour < 8
5. **Weekend handling:** Separate logic handles weekend skipping (not affected by this fix)

## Conclusion

The fix resolves the premature jump to 13:00 by ensuring `getNextAvailableTimeAfterBreak()` correctly identifies which specific unavailable period (lunch vs. night) a slot overlaps, and jumps to the appropriate end time for that period.

**Result:** Morning slots (08:00-10:00, 10:00-12:00) are now correctly generated when the main schedule includes these times, regardless of where the schedule starts.
