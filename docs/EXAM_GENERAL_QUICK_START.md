# Quick Start Guide - UKOM Exam General Component
## ✨ What Was Created
A reusable component for managing **PRAKTIK**, **PORTOFOLIO**, and **STUDI_KASUS** exam participants and their examiners.
## 📍 File Locations
```
/src/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-general/
├── ukom-exam-general.component.ts
├── ukom-exam-general.component.html
├── ukom-exam-general.component.scss
└── update-examiner-modal/
    ├── update-examiner-modal.component.ts
    ├── update-examiner-modal.component.html
    └── update-examiner-modal.component.scss
```
## 🚀 How to Use
The component is **already integrated** in the parent component. It will automatically display for PRAKTIK, PORTOFOLIO, and STUDI_KASUS exam types.
### Navigation Path:
1. Go to: **UKOM → Room List**
2. Click on a room
3. Click **"Tambah Jadwal"** or view existing schedule
4. Select exam type: **PRAKTIK** / **PORTOFOLIO** / **STUDI_KASUS**
5. The general component will display
## 📊 What It Does
### Main View:
- **Displays participants** in an AG Grid table
- Shows **participant name, NIP, and examiners**
- Provides **"Ubah Penguji"** button for each participant
### Modal View (Change Examiner):
- Shows participant information
- Lists all available examiners
- Allows **multiple examiner selection**
- Pre-selects current examiners
- Visual feedback for selections
## 🔧 Current Status
✅ **UI Complete** - All components created and styled
✅ **Logic Complete** - All data flow and state management working
✅ **Integration Complete** - Connected to parent component
⚠️ **API Pending** - Submit functionality shows placeholder alert
## ⚙️ To Complete API Integration
### 1. Backend (Required)
Create endpoint:
```
POST /api/v1/exam-schedule/participant/{participantScheduleId}/examiners
Body: { examinerScheduleIdList: string[] }
```
### 2. Frontend (Update these files)
**File:** `ukom-exam-schedule.service.ts`
```typescript
updateExaminerForParticipantScheduleByParticipantScheduleId(
    request: UpdateExaminerForParticipantRequest
): Observable<any> {
    return this.http.post(
        `/api/v1/exam-schedule/participant/${request.participantScheduleId}/examiners`,
        request
    )
}
```
**File:** `ukom-exam-general.component.ts`
Replace lines ~190-200 in `confirmExaminerUpdate()`:
```typescript
// BEFORE (current placeholder):
alert('TODO: Implementasi API untuk mengubah penguji')
// AFTER (actual implementation):
const request = new UpdateExaminerForParticipantRequest({
    participantScheduleId: participant.id,
    examinerScheduleIdList: examinerIds,
})
this.examScheduleService
    .updateExaminerForParticipantScheduleByParticipantScheduleId(request)
    .subscribe({
        next: () => {
            this.handlerService.handleAlert('Success', 'Penguji berhasil diubah')
            this.participantListRefresh.emit()
            this.closeExaminerModal()
        },
        error: (err) => {
            console.error('Update examiner failed', err)
            this.handlerService.handleAlert('Error', 'Gagal mengubah penguji')
        },
    })
```
## 🧪 Testing Steps
### Manual Testing:
1. ✅ Navigate to PRAKTIK exam type
2. ✅ Verify participants display in table
3. ✅ Verify examiner names show correctly
4. ✅ Click "Ubah Penguji" button
5. ✅ Verify modal opens
6. ✅ Verify current examiners are pre-selected (blue background)
7. ✅ Select/deselect examiners
8. ✅ Verify selected count updates
9. ✅ Click "Simpan"
10. ⏳ Verify API call (when implemented)
11. ⏳ Verify success notification
12. ⏳ Verify table refreshes
### Repeat for:
- ✅ PORTOFOLIO exam type
- ✅ STUDI_KASUS exam type
## 🎯 Key Features
| Feature | Status |
|---------|--------|
| Participant list display | ✅ Complete |
| Examiner names from API | ✅ Complete |
| Multiple examiner support | ✅ Complete |
| Change examiner modal | ✅ Complete |
| Pre-selection logic | ✅ Complete |
| Visual feedback | ✅ Complete |
| Validation | ✅ Complete |
| API integration | ⚠️ Pending |
## 📝 Data Structure Reference
### Participant Data:
```typescript
interface ParticipantScheduleList {
    id: string
    participantUkom?: {
        name: string
        nip: string
    }
    examScheduleSupervised?: [{
        examinerScheduleId: string
    }]
}
```
### Examiner Data:
```typescript
interface ExaminerScheduleList {
    id: string
    examinerUkom?: {
        user?: { name: string }
        nip: string
    }
}
```
## 🐛 Troubleshooting
### Issue: Component not showing
- ✅ Check exam type is PRAKTIK, PORTOFOLIO, or STUDI_KASUS
- ✅ Check parent component imports
- ✅ Check route parameters
### Issue: No examiners showing
- ✅ Check `examScheduleSupervised` exists in API response
- ✅ Check `examinerList` is populated
- ✅ Check console for mapping errors
### Issue: Modal not opening
- ✅ Check button click handler
- ✅ Check `showExaminerModal` signal
- ✅ Check browser console for errors
## 📚 Documentation Files
1. **EXAM_GENERAL_COMPONENT_README.md** - Detailed documentation
2. **EXAM_GENERAL_IMPLEMENTATION_SUMMARY.md** - Implementation summary
3. **EXAM_GENERAL_COMPONENT_STRUCTURE.md** - Visual structure and flow
4. **EXAM_GENERAL_QUICK_START.md** - This file
## 💡 Tips
- The component uses Angular **signals** for reactive state
- AG Grid provides professional table features (sort, filter, pagination)
- Multiple examiner selection is built-in
- Component is **reusable** across 3 exam types
- Follows same patterns as WAWANCARA and MAKALAH components
## 🚦 Next Steps
1. **Backend Dev**: Create the API endpoint
2. **Frontend Integration**: Connect API to component
3. **Testing**: Comprehensive testing with real data
4. **Deployment**: Deploy to staging environment
5. **User Testing**: Get feedback from actual users
## 📞 Support
For questions or issues:
- Review documentation in `/docs/EXAM_GENERAL_*.md`
- Check similar implementations: WAWANCARA component
- Review parent component: `ukom-exam-choose-comp-questions`
---
**Status:** Ready for API integration ✅
**Last Updated:** February 24, 2026
