import { ScheduleItem } from './schedule-timeline.component'

// Demo data generator that creates dynamic schedule data based on current date
export function generateDemoScheduleData(count: number = 200): ScheduleItem[] {
    const schedules: ScheduleItem[] = []
    const today = new Date()

    const jenisUkomTypes = [
        'PERPINDAHAN_JABATAN',
        'KENAIKAN_JENJANG',
        'PROMOSI',
    ]

    const jenisUjianTypes = [
        'CAT',
        'Wawancara',
        'Praktik',
        'Portfolio',
        'Studi Kasus',
        'Makalah',
    ]

    const jabatanNames = [
        'Negosiator Perdagangan',
        'Penera',
        'Analis Perdagangan',
        'Pengawas Perdagangan',
        'Penguji Mutu Barang',
        'Pengamat Tera',
    ]

    const jenjangNames = [
        'Ahli Utama',
        'Ahli Madya',
        'Ahli Muda',
        'Ahli Pertama',
        'Penyelia',
        'Terampil',
    ]

    const unitKerjaNames = [
        'Pusbin',
        'BKN',
        'Kemendag',
        'Ditjen Perdagangan',
        'BPKP',
        'Kemenkeu',
    ]

    // Duration options in hours (>= 30 minutes)
    const durationOptions = [0.5, 0.75, 1, 1.5, 2]

    for (let i = 0; i < count; i++) {
        const dayOffset = Math.floor(Math.random() * 4) - 1
        const scheduleDate = new Date(today)
        scheduleDate.setDate(scheduleDate.getDate() + dayOffset)

        // Hour 08:00 – 17:00
        const hour = 8 + Math.floor(Math.random() * 10)

        // 60% clean (00,15,30,45) – 40% weird (0–59)
        const minute =
            Math.random() < 0.6
                ? Math.floor(Math.random() * 4) * 15
                : Math.floor(Math.random() * 60)

        scheduleDate.setHours(hour, minute, 0, 0)

        const personalSchedule = formatDateForSchedule(scheduleDate)

        const duration =
            durationOptions[Math.floor(Math.random() * durationOptions.length)]

        const participantScheduleId = generateUUID()
        const participantId = generateUUID()
        const examScheduleId = generateUUID()

        const jenisUkom =
            jenisUkomTypes[Math.floor(Math.random() * jenisUkomTypes.length)]
        const jenisUjian =
            jenisUjianTypes[Math.floor(Math.random() * jenisUjianTypes.length)]
        jabatanNames[Math.floor(Math.random() * jabatanNames.length)]
        const nextJabatanName =
            jabatanNames[Math.floor(Math.random() * jabatanNames.length)]
        jenjangNames[Math.floor(Math.random() * jenjangNames.length)]
        const nextJenjangName =
            jenjangNames[Math.floor(Math.random() * jenjangNames.length)]
        const unitKerjaName =
            unitKerjaNames[Math.floor(Math.random() * unitKerjaNames.length)]

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
            nextJabatanName,
            nextJenjangName,
            unitKerjaName,
            jenisUkom,
            jenisUjian,
        })
    }

    schedules.sort(
        (a, b) =>
            new Date(a.personalSchedule.replace(' ', 'T')).getTime() -
            new Date(b.personalSchedule.replace(' ', 'T')).getTime(),
    )

    return schedules
}

// Helpers unchanged
function formatDateForSchedule(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = '00'
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

function generateNIP(): string {
    let nip = ''
    for (let i = 0; i < 18; i++) nip += Math.floor(Math.random() * 10)
    return nip
}
