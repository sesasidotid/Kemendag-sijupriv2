# Quick Test Guide - Status Pendaftaran UKom

## How to Test the Changes

### 1. Access the Component
Navigate to the status pendaftaran page (likely `/status-pendaftaran-ukom?key=PARTICIPANT_KEY`)

### 2. Check Score Display

**Expected Behavior:**
- For participants with finish status, you should see a "Detail UKom" section
- Each exam schedule should display as a separate item (CAT, Makalah, etc.)
- Click "Lihat Nilai" to open modal with score details

### 3. Test CAT Score Display

**What to check:**
- Total score displays at the top
- Competency groups show with percentages
- Each competency shows: name, percentage, correct/total answers

**Component Used:** `app-cat-score`

### 4. Test Makalah Display

**What to check:**
- "Lihat Makalah" button appears
- Clicking button opens the uploaded file
- Uses file preview service

### 5. Test Other Exam Types (Portofolio, Studi Kasus, etc.)

**What to check:**
- Display name matches exam type code
- "Lihat Nilai" button appears
- Modal shows score with breakdown (if available)
- Shows percentage: X% (score/max)

**Component Used:** `app-generic-score`

## API Calls to Monitor

Open browser DevTools > Network tab and look for:

```
GET /api/v1/exam_grade/{examScheduleId}?key={participantKey}
```

**Expected:**
- One call per exam schedule in `finishTask.examSchedule`
- Each call uses a different examScheduleId (UUID format)
- Response contains score data for that specific exam

## Console Logs

Check browser console for:
```
Scores loaded: { 'exam-schedule-id-1': {...}, 'exam-schedule-id-2': {...} }
```

## Edge Cases to Test

1. **No scores available** - Should show no "Detail UKom" section
2. **Mixed exam types** - CAT + Makalah + Portofolio should all display correctly
3. **Multiple exams of same type** - Each should display separately with different scores
4. **Score with 0 value** - Should still display correctly
5. **Missing score data** - Should handle gracefully without errors

## Common Issues

### Issue: "Detail UKom" not showing
**Check:**
- `finishTask.examSchedule` array has items
- API responses are successful
- At least one score is non-null in scoreMap

### Issue: Modal shows wrong score
**Check:**
- `selectedExamScheduleId` is being set correctly
- Click handler passes `examSchedule.id`
- `getSelectedScore()` returns correct score

### Issue: Generic score component shows nothing
**Check:**
- Score object has required properties
- `score?.score` value exists
- Component is properly imported

## Verification Checklist

- [ ] Score list displays for finished participants
- [ ] CAT score modal opens and shows competency breakdown
- [ ] Makalah "Lihat Makalah" opens file preview
- [ ] Other exam types show in modal with score details
- [ ] Multiple exams of same type display separately
- [ ] No console errors
- [ ] API calls use examScheduleId (not exam type code)
- [ ] scoreMap is keyed by examScheduleId
- [ ] Modal closes properly
- [ ] Score components render correctly

## Success Criteria

✅ All exam schedules display in the list
✅ Click handlers work for all buttons
✅ CAT modal shows using app-cat-score component
✅ Generic modal shows using app-generic-score component
✅ API calls use correct endpoint structure
✅ No TypeScript or runtime errors
✅ Score data maps correctly to UI

## Rollback Plan

If issues occur, the main changes are in:
1. `getAllScoresFlow()` method - Change back to loop exam types
2. HTML template score display section - Revert to static checks
3. Modal content - Revert to inline implementation

Previous implementation used:
- `scoreMap['CAT']` instead of `scoreMap[examScheduleId]`
- Loop through exam types instead of exam schedules
- API endpoint with exam type code instead of schedule ID

