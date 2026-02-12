#!/usr/bin/env node

/**
 * Exam Schedule Automation Script
 *
 * Usage:
 *   node createSchedules.mjs --baseStart=2026-02-11T10:30
 *   node createSchedules.mjs (uses current datetime)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    baseUrl: "http://103.217.144.101:8000",

    // Room and examiner configuration
    roomUkomId: "eb050024-4f81-4051-ba33-7bbb76560a1b", // Replace with actual room ID
    examinerIdList: [
        "e699b126-3be4-4490-add5-5feb583a1310",
        "d666f6ea-37ec-411c-818c-9e23d1f74dfa",
    ], // Replace with actual examiner IDs
    participantIdList: [],

    // Duration configuration (in hours)
    durations: {
        wawancara: 0.17, // ~10 minutes
        portofolio: 0.5, // 30 minutes
        praktik: 0.5, // 30 minutes
        studi_kasus: 0.5, // 30 minutes
        makalah: {
            makalah: 0.17, // ~10 minutes
            seminar: 1.0, // 60 minutes
        },
    },

    // Secret keys per exam type
    secretKeys: {
        studi_kasus: "1",
        // Others use null or omit
    },
}

// ============================================================================
// BASE PAYLOAD TEMPLATES
// ============================================================================

const PAYLOAD_TEMPLATES = {
  wawancara: {
    duration: 0.17,
    endTime: '2026-02-11T11:00',
    examinerIdList: [],
    participantIdList: [],
    roomUkomId: '',
    startTime: '2026-02-11T10:30',
  },

  portofolio: {
    endTime: '2026-02-11T11:00',
    examinerIdList: [],
    participantIdList: [],
    roomUkomId: '',
    secretKey: null,
    startTime: '2026-02-11T10:30',
  },

  praktik: {
    endTime: '2026-02-11T11:00',
    examinerIdList: [],
    participantIdList: [],
    roomUkomId: '',
    secretKey: null,
    startTime: '2026-02-11T10:30',
  },

  studi_kasus: {
    endTime: '2026-02-11T11:00',
    examinerIdList: [],
    participantIdList: [],
    roomUkomId: '',
    secretKey: '1',
    startTime: '2026-02-11T10:30',
  },

  makalah: {
    duration: 0.17,
    examinerIdList: [],
    makalahEndTime: '2026-02-11T11:00',
    makalahStartTime: '2026-02-11T10:30',
    participantIdList: [],
    roomUkomId: '',
    seminarEndTime: '2026-02-11T12:00',
    seminarStartTime: '2026-02-11T11:00',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (const arg of args) {
    if (arg.startsWith('--baseStart=')) {
      parsed.baseStart = arg.split('=')[1];
    }
  }

  return parsed;
}

/**
 * Get base start time from CLI or current datetime
 */
function getBaseStartTime(cliBaseStart) {
  if (cliBaseStart) {
    const date = new Date(cliBaseStart);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid baseStart format: ${cliBaseStart}. Expected: YYYY-MM-DDTHH:mm`);
    }
    return date;
  }

  // Use current datetime rounded to minutes
  const now = new Date();
  now.setSeconds(0, 0);
  return now;
}

/**
 * Format date to ISO string without seconds (YYYY-MM-DDTHH:mm)
 */
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Add hours to a date
 */
function addHours(date, hours) {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + Math.round(hours * 60));
  return newDate;
}

/**
 * Deep clone an object
 */
function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Build payload for non-makalah exam types
 */
function buildStandardPayload(examType, baseStart) {
  const template = cloneObject(PAYLOAD_TEMPLATES[examType]);
  const duration = CONFIG.durations[examType];

  const startTime = baseStart;
  const endTime = addHours(startTime, duration);

  // Update template with dynamic values
  template.startTime = formatDateTime(startTime);
  template.endTime = formatDateTime(endTime);
  template.roomUkomId = CONFIG.roomUkomId;
  template.examinerIdList = CONFIG.examinerIdList;
  template.participantIdList = CONFIG.participantIdList;

  // Update duration if present in template
  if ('duration' in template) {
    template.duration = CONFIG.durations[examType];
  }

  // Update secret key if configured
  if (examType in CONFIG.secretKeys) {
    template.secretKey = CONFIG.secretKeys[examType];
  }

  return template;
}

/**
 * Build payload for makalah exam type
 */
function buildMakalahPayload(baseStart) {
  const template = cloneObject(PAYLOAD_TEMPLATES.makalah);
  const { makalah: makalahDuration, seminar: seminarDuration } = CONFIG.durations.makalah;

  const makalahStartTime = baseStart;
  const makalahEndTime = addHours(makalahStartTime, makalahDuration);
  const seminarStartTime = makalahEndTime;
  const seminarEndTime = addHours(seminarStartTime, seminarDuration);

  // Update template with dynamic values
  template.makalahStartTime = formatDateTime(makalahStartTime);
  template.makalahEndTime = formatDateTime(makalahEndTime);
  template.seminarStartTime = formatDateTime(seminarStartTime);
  template.seminarEndTime = formatDateTime(seminarEndTime);
  template.roomUkomId = CONFIG.roomUkomId;
  template.examinerIdList = CONFIG.examinerIdList;
  template.participantIdList = CONFIG.participantIdList;
  template.duration = CONFIG.durations.makalah.makalah;

  return template;
}

/**
 * Send POST request to endpoint
 */
async function sendPostRequest(endpoint, payload) {
  const url = `${CONFIG.baseUrl}${endpoint}`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📤 Sending request to: ${endpoint}`);
  console.log(`${'='.repeat(80)}`);
  console.log('Payload:');
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      console.error(`❌ Request failed with status ${response.status}`);
      console.error('Response:', responseData);
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(responseData)}`);
    }

    console.log(`✅ Success! Status: ${response.status}`);
    console.log('Response:', responseData);

    return responseData;
  } catch (error) {
    console.error(`❌ Error sending request to ${endpoint}:`, error.message);
    throw error;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Exam Schedule Automation Script');
  console.log('=' .repeat(80));

  // Parse CLI arguments
  const args = parseArgs();

  // Get base start time
  const baseStart = getBaseStartTime(args.baseStart);
  console.log(`\n📅 Base start time: ${formatDateTime(baseStart)}`);

  if (args.baseStart) {
    console.log(`   (from CLI argument: ${args.baseStart})`);
  } else {
    console.log(`   (using current datetime)`);
  }

  // Validate configuration
  if (!CONFIG.roomUkomId || CONFIG.roomUkomId === 'YOUR_ROOM_ID') {
    console.warn('\n⚠️  WARNING: roomUkomId is not configured!');
    console.warn('   Update CONFIG.roomUkomId in the script before running.');
  }

  if (!CONFIG.examinerIdList || CONFIG.examinerIdList.length === 0) {
    console.warn('\n⚠️  WARNING: examinerIdList is empty!');
    console.warn('   Update CONFIG.examinerIdList in the script before running.');
  }

  // Define exam schedules to create
  const schedules = [
    {
      name: 'wawancara',
      endpoint: '/api/v1/exam_schedule/wawancara',
      buildPayload: () => buildStandardPayload('wawancara', baseStart),
    },
    {
      name: 'portofolio',
      endpoint: '/api/v1/exam_schedule/portofolio',
      buildPayload: () => buildStandardPayload('portofolio', baseStart),
    },
    {
      name: 'praktik',
      endpoint: '/api/v1/exam_schedule/praktik',
      buildPayload: () => buildStandardPayload('praktik', baseStart),
    },
    {
      name: 'studi_kasus',
      endpoint: '/api/v1/exam_schedule/studi_kasus',
      buildPayload: () => buildStandardPayload('studi_kasus', baseStart),
    },
    {
      name: 'makalah',
      endpoint: '/api/v1/exam_schedule/makalah',
      buildPayload: () => buildMakalahPayload(baseStart),
    },
  ];

  // Execute requests sequentially
  let successCount = 0;
  let failureCount = 0;
  const errors = [];

  for (const schedule of schedules) {
    try {
      const payload = schedule.buildPayload();
      await sendPostRequest(schedule.endpoint, payload);
      successCount++;
    } catch (error) {
      failureCount++;
      errors.push({ schedule: schedule.name, error: error.message });
    }
  }

  // Print summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ schedule, error }) => {
      console.log(`   - ${schedule}: ${error}`);
    });
  }

  // Exit with appropriate code
  if (failureCount > 0) {
    console.log('\n⚠️  Some requests failed. Exiting with error code 1.');
    process.exit(1);
  }

  console.log('\n✅ All requests completed successfully!');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

