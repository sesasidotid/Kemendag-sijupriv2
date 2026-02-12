# Exam Schedule Automation Script

This script automatically generates exam schedules by sending POST requests to multiple endpoints with dynamically calculated time values.

## Prerequisites

- Node.js 18+ (for native `fetch` support)

## Configuration

Before running the script, **update these values** in `createSchedules.mjs`:

```javascript
const CONFIG = {
  baseUrl: 'http://103.217.144.101:8000',
  
  // ⚠️ REQUIRED: Replace these with actual values
  roomUkomId: 'YOUR_ROOM_ID',        // Replace with actual room ID
  examinerIdList: [],                 // Replace with actual examiner IDs, e.g., ['id1', 'id2']
  participantIdList: [],              // Add participant IDs if needed
  
  // Optional: Adjust durations (in hours)
  durations: {
    wawancara: 0.17,      // ~10 minutes
    portofolio: 0.5,      // 30 minutes
    praktik: 0.5,         // 30 minutes
    studi_kasus: 0.5,     // 30 minutes
    makalah: {
      makalah: 0.17,      // ~10 minutes
      seminar: 1.0,       // 60 minutes
    },
  },
};
```

## Usage

### With custom start time:
```bash
node createSchedules.mjs --baseStart=2026-02-11T10:30
```

### Using current datetime:
```bash
node createSchedules.mjs
```

## How It Works

1. **Time Calculation**: 
   - Takes a base start time (from CLI or current datetime)
   - Calculates end times based on configured durations
   - For makalah: calculates both makalah and seminar time ranges

2. **Request Generation**:
   - Clones base payload templates
   - Overrides time fields dynamically
   - Injects configured IDs and durations
   - Sends POST requests sequentially

3. **Endpoints Called** (in order):
   - `/api/v1/exam_schedule/wawancara`
   - `/api/v1/exam_schedule/portofolio`
   - `/api/v1/exam_schedule/praktik`
   - `/api/v1/exam_schedule/studi_kasus`
   - `/api/v1/exam_schedule/makalah`

## Output

The script provides detailed logging:
- Each endpoint being called
- Complete payload being sent
- HTTP status codes
- Success/failure messages
- Final summary with counts

## Error Handling

- If any request fails, the script:
  - Logs the error details
  - Continues with remaining requests
  - Exits with code 1 at the end
  
- If all requests succeed:
  - Exits with code 0

## Examples

### Example 1: Schedule for tomorrow at 9 AM
```bash
node createSchedules.mjs --baseStart=2026-02-12T09:00
```

### Example 2: Schedule starting now
```bash
node createSchedules.mjs
```

## Customization

### Change Duration
Edit the `CONFIG.durations` object to adjust exam lengths.

### Add More Examiners
Update `CONFIG.examinerIdList` with additional IDs:
```javascript
examinerIdList: ['examiner1', 'examiner2', 'examiner3'],
```

### Change Base URL
Update `CONFIG.baseUrl` if the API endpoint changes.

### Add Authorization
If the API requires authentication, modify the `sendPostRequest` function to add headers:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN',
},
```

## Troubleshooting

**Warning: roomUkomId is not configured**
- Update `CONFIG.roomUkomId` with a valid room ID

**Warning: examinerIdList is empty**
- Update `CONFIG.examinerIdList` with valid examiner IDs

**HTTP 400/401/403 errors**
- Check if the API requires authentication
- Verify the payload structure matches API expectations

**Connection errors**
- Verify the API server is running
- Check network connectivity
- Confirm the base URL is correct

