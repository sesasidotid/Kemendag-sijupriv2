import { ScheduleItem } from './schedule-timeline.component'

// Demo data generator that creates dynamic schedule data based on current date
export function generateDemoScheduleData(count: number = 200): ScheduleItem[] {
    const schedules: ScheduleItem[] = []
    const today = new Date()

    // Define jenis ukom types for variety
    const jenisUkomTypes = [
        'PERPINDAHAN_JABATAN',
        'KENAIKAN_JENJANG',
        'PENGANGKATAN_PERTAMA',
        'PENYESUAIAN',
        'INPASSING',
        'PROMOSI',
    ]

    // Define jabatan names
    const jabatanNames = [
        'Penyelia',
        'Penera',
        'Analis',
        'Pengawas',
        'Administrator',
        'Koordinator',
    ]

    // Define jenjang names
    const jenjangNames = [
        'Ahli Utama',
        'Ahli Madya',
        'Ahli Muda',
        'Ahli Pertama',
        'Penyelia',
        'Terampil',
    ]

    // Define unit kerja names
    const unitKerjaNames = [
        'Pusbin',
        'BKN',
        'Kemendag',
        'Ditjen Perdagangan',
        'BPKP',
        'Kemenkeu',
    ]

    // Duration options in hours
    const durationOptions = [0.25, 0.5, 0.75, 1, 1.5, 2]

    // Generate schedules spread across the day
    for (let i = 0; i < count; i++) {
        // Random day offset (-1 to +2 days from today)
        const dayOffset = Math.floor(Math.random() * 4) - 1
        const scheduleDate = new Date(today)
        scheduleDate.setDate(scheduleDate.getDate() + dayOffset)

        // Random hour between 8 AM and 6 PM (18:00)
        const hour = 8 + Math.floor(Math.random() * 10)
        // Random minute in 15-minute intervals
        const minute = Math.floor(Math.random() * 4) * 15

        scheduleDate.setHours(hour, minute, 0, 0)

        // Format date as "YYYY-MM-DD HH:mm:ss"
        const personalSchedule = formatDateForSchedule(scheduleDate)

        // Random duration
        const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)]

        // Generate UUID
        const participantScheduleId = generateUUID()
        const participantId = generateUUID()
        const examScheduleId = generateUUID()

        // Random selections
        const jenisUkom = jenisUkomTypes[Math.floor(Math.random() * jenisUkomTypes.length)]
        const jabatanName = jabatanNames[Math.floor(Math.random() * jabatanNames.length)]
        const jenjangName = jenjangNames[Math.floor(Math.random() * jenjangNames.length)]
        const unitKerjaName = unitKerjaNames[Math.floor(Math.random() * unitKerjaNames.length)]

        // Generate NIP (18 digits)
        const nip = generateNIP()

        schedules.push({
            participantScheduleId,
            examScheduleId,
            personalSchedule,
            duration,
            participantId,
            name: `Peserta ${i + 1}`,
            email: `peserta${i + 1}@example.com`,
            phone: `08${Math.floor(100000000 + Math.random() * 900000000)}`,
            nip,
            jabatanName,
            jenjangName,
            unitKerjaName,
            jenisUkom,
        })
    }

    // Sort by personal schedule
    schedules.sort((a, b) =>
        new Date(a.personalSchedule.replace(' ', 'T')).getTime() -
        new Date(b.personalSchedule.replace(' ', 'T')).getTime()
    )

    return schedules
}

// Format date as "YYYY-MM-DD HH:mm:ss"
function formatDateForSchedule(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = '00'

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Generate UUID v4
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

// Generate NIP (18 digits)
function generateNIP(): string {
    let nip = ''
    for (let i = 0; i < 18; i++) {
        nip += Math.floor(Math.random() * 10).toString()
    }
    return nip
}
