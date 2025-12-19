import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { HandlerService } from '@/modules/base/services/handler.service'

type ExamStatus = 'ongoing' | 'upcoming' | 'completed'

interface GroupedExam {
    schedule: ExamSchedule
    status: ExamStatus
    displayName: string
    participantCount: number
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    private router = inject(Router)
    private jenisUkomService = inject(JenisUkomService)
    private handlerService = inject(HandlerService)

    // Participant list management
    showParticipantList = signal<string | null>(null)
    selectedExamForParticipants = signal<GroupedExam | null>(null)

    // Dummy data - replace with actual API call
    private schedules = signal<ExamSchedule[]>([
        new ExamSchedule({
            id: '36c814b0-653f-4474-99b4-827731aa57d3',
            startTime: '2025-12-19 03:55:00',
            endTime: '2025-12-19 23:55:00',
            duration: 0.5,
            examTypeCode: ExamTypeCategory.WAWANCARA,
            roomUkomId: 'b54e37a3-bcf9-4158-82f6-8b2fcc7103b0',
            secretKey: null,
            participantScheduleList: [
                {
                    id: 'psl-1',
                    participantId: 'participant-1',
                    examScheduleId: '36c814b0-653f-4474-99b4-827731aa57d3',
                    participantUkom: new Participant({
                        id: 'participant-1',
                        name: 'Budi Santoso',
                        nip: '198501012010011001',
                        nextJabatanName: 'Penera',
                        nextJenjangName: 'Ahli Utama',
                        bidangJabatanName: 'Metrologi',
                        jenisUkom: 'PERPINDAHAN_JABATAN',
                    }),
                },
            ],
        }),
        new ExamSchedule({
            id: 'exam-portofolio-001',
            startTime: '2025-12-19 03:55:00',
            endTime: '2025-12-19 23:55:00',
            duration: 0.5,
            examTypeCode: ExamTypeCategory.PORTOFOLIO,
            roomUkomId: 'room-portofolio-001',
            secretKey: null,
            participantScheduleList: [
                {
                    id: 'psl-portofolio-001',
                    participantId: 'participant-1',
                    examScheduleId: 'exam-portofolio-001',
                    participantUkom: new Participant({
                        id: 'participant-1',
                        name: 'Budi Santoso',
                        nip: '198501012010011001',
                        nextJabatanName: 'Penera',
                        nextJenjangName: 'Ahli Utama',
                        bidangJabatanName: 'Metrologi',
                        jenisUkom: 'PERPINDAHAN_JABATAN',
                    }),
                },
            ],
        }),
        new ExamSchedule({
            id: 'exam-studi-kasus-001',
            startTime: '2025-12-19 03:55:00',
            endTime: '2025-12-19 23:55:00',
            duration: 0.5,
            examTypeCode: ExamTypeCategory.STUDI_KASUS,
            roomUkomId: 'room-studi-kasus-001',
            secretKey: null,
            participantScheduleList: [
                {
                    id: 'psl-studi-kasus-001',
                    participantId: 'participant-1',
                    examScheduleId: 'exam-studi-kasus-001',
                    participantUkom: new Participant({
                        id: 'participant-1',
                        name: 'Budi Santoso',
                        nip: '198501012010011001',
                        nextJabatanName: 'Penera',
                        nextJenjangName: 'Ahli Utama',
                        bidangJabatanName: 'Metrologi',
                        jenisUkom: 'PERPINDAHAN_JABATAN',
                    }),
                },
            ],
        }),
        new ExamSchedule({
            id: '5e2f4d2e-5f4b-4c3a-9f7e-2d3b6c8e9f0a',
            startTime: '2025-12-19 10:01:00',
            endTime: '2025-12-20 10:01:00',
            duration: 2,
            examTypeCode: ExamTypeCategory.MAKALAH,
            roomUkomId: 'b54e37a3-bcf9-4158-82f6-8b2fcc7103b0',
            secretKey: null,
            participantScheduleList: [
                {
                    id: 'psl-4',
                    participantId: 'participant-4',
                    examScheduleId: '5e2f4d2e-5f4b-4c3a-9f7e-2d3b6c8e9f0a',
                    participantUkom: new Participant({
                        id: 'participant-4',
                        name: 'Dewi Lestari',
                        nip: '198805102012012004',
                        nextJabatanName: 'Pranata Perdagangan',
                        nextJenjangName: 'Ahli Madya',
                        bidangJabatanName: 'Perdagangan',
                        jenisUkom: 'KENAIKAN_JENJANG',
                    }),
                },
                {
                    id: 'psl-5',
                    participantId: 'participant-5',
                    examScheduleId: '5e2f4d2e-5f4b-4c3a-9f7e-2d3b6c8e9f0a',
                    participantUkom: new Participant({
                        id: 'participant-5',
                        name: 'Rudi Hartono',
                        nip: '199105252016011005',
                        nextJabatanName: 'Pengawas Perdagangan',
                        nextJenjangName: 'Ahli Pertama',
                        bidangJabatanName: 'Pengawasan',
                        jenisUkom: 'PERPINDAHAN_JABATAN',
                    }),
                },
            ],
        }),
        new ExamSchedule({
            id: '84f3d3af-7836-4426-8337-50426596b835',
            startTime: '2025-12-29 10:01:00',
            endTime: '2025-12-30 19:01:00',
            duration: 0.25,
            examTypeCode: ExamTypeCategory.SEMINAR,
            roomUkomId: 'b54e37a3-bcf9-4158-82f6-8b2fcc7103b0',
            secretKey: '1',
            participantScheduleList: [
                {
                    id: 'psl-6',
                    participantId: 'participant-6',
                    examScheduleId: '84f3d3af-7836-4426-8337-50426596b835',
                    participantUkom: new Participant({
                        id: 'participant-6',
                        name: 'Rina Wati',
                        nip: '198612152013012006',
                        nextJabatanName: 'Penera',
                        nextJenjangName: 'Ahli Madya',
                        bidangJabatanName: 'Kemetrologian',
                        jenisUkom: 'KENAIKAN_JENJANG',
                    }),
                },
            ],
        }),
        new ExamSchedule({
            id: 'abc123-completed',
            startTime: '2025-12-16 08:00:00',
            endTime: '2025-12-16 12:00:00',
            duration: 4,
            examTypeCode: ExamTypeCategory.PRAKTIK,
            roomUkomId: 'b54e37a3-bcf9-4158-82f6-8b2fcc7103b0',
            secretKey: null,
            participantScheduleList: [
                {
                    id: 'psl-7',
                    participantId: 'participant-7',
                    examScheduleId: 'abc123-completed',
                    participantUkom: new Participant({
                        id: 'participant-7',
                        name: 'Agus Setiawan',
                        nip: '198408202014011007',
                        nextJabatanName: 'Auditor',
                        nextJenjangName: 'Ahli Utama',
                        bidangJabatanName: 'Pengawasan',
                        jenisUkom: 'KENAIKAN_JENJANG',
                    }),
                },
                {
                    id: 'psl-8',
                    participantId: 'participant-8',
                    examScheduleId: 'abc123-completed',
                    participantUkom: new Participant({
                        id: 'participant-8',
                        name: 'Maya Sari',
                        nip: '199207302017012008',
                        nextJabatanName: 'Analis Kebijakan',
                        nextJenjangName: 'Ahli Muda',
                        bidangJabatanName: 'Kebijakan Publik',
                        jenisUkom: 'PERPINDAHAN_JABATAN',
                    }),
                },
            ],
        }),
    ])

    currentDate = signal(new Date())
    showCompletedExams = signal(false)

    // Computed values
    groupedExams = computed(() => this.groupExamsByStatus())

    ongoingExam = computed(() =>
        this.groupedExams().filter((e) => e.status === 'ongoing'),
    )

    upcomingExams = computed(() =>
        this.groupedExams().filter((e) => e.status === 'upcoming'),
    )

    completedExams = computed(() =>
        this.groupedExams().filter((e) => e.status === 'completed'),
    )

    // Format current date for display
    formattedCurrentDate = computed(() => {
        const date = this.currentDate()
        const days = [
            'Minggu',
            'Senin',
            'Selasa',
            'Rabu',
            'Kamis',
            'Jumat',
            'Sabtu',
        ]
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'Mei',
            'Jun',
            'Jul',
            'Agu',
            'Sep',
            'Okt',
            'Nov',
            'Des',
        ]

        const dayName = days[date.getDay()]
        const day = date.getDate()
        const month = months[date.getMonth()]
        const year = date.getFullYear()

        return `${dayName}, ${day} ${month} ${year}`
    })

    constructor() {}
    ngOnInit(): void {
        // Update current time every minute
        setInterval(() => {
            this.currentDate.set(new Date())
        }, 60000)
    }

    private groupExamsByStatus(): GroupedExam[] {
        const now = this.currentDate()
        const grouped: GroupedExam[] = []

        this.schedules().forEach((schedule) => {
            const startTime = this.parseDateTime(schedule.startTime)
            const endTime = this.parseDateTime(schedule.endTime)

            let status: ExamStatus
            if (now >= startTime && now <= endTime) {
                status = 'ongoing'
            } else if (now < startTime) {
                status = 'upcoming'
            } else {
                status = 'completed'
            }

            grouped.push({
                schedule,
                status,
                displayName: this.getExamDisplayName(schedule.examTypeCode),
                participantCount: schedule.participantScheduleList?.length || 0,
            })
        })

        // Sort: ongoing first, then upcoming by start time, then completed by end time desc
        return grouped.sort((a, b) => {
            if (a.status === 'ongoing' && b.status !== 'ongoing') return -1
            if (a.status !== 'ongoing' && b.status === 'ongoing') return 1

            if (a.status === 'upcoming' && b.status === 'upcoming') {
                return (
                    this.parseDateTime(a.schedule.startTime).getTime() -
                    this.parseDateTime(b.schedule.startTime).getTime()
                )
            }

            if (a.status === 'completed' && b.status === 'completed') {
                return (
                    this.parseDateTime(b.schedule.endTime).getTime() -
                    this.parseDateTime(a.schedule.endTime).getTime()
                )
            }

            return 0
        })
    }

    private parseDateTime(dateTimeStr: string): Date {
        // Convert "2025-12-16 13:55:00" to Date object
        const [datePart, timePart] = dateTimeStr.split(' ')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hour, minute, second] = timePart.split(':').map(Number)

        return new Date(year, month - 1, day, hour, minute, second)
    }

    private getExamDisplayName(examTypeCode: string): string {
        const displayNames: Record<string, string> = {
            CAT: 'CAT',
            PRAKTIK: 'Praktik',
            WAWANCARA: 'Wawancara',
            MAKALAH: 'Makalah',
            SEMINAR: 'Seminar',
            PORTOFOLIO: 'Portofolio',
            STUDI_KASUS: 'Studi Kasus',
        }

        return displayNames[examTypeCode] || examTypeCode
    }

    formatDateRange(startTime: string, endTime: string): string {
        const start = this.parseDateTime(startTime)
        const end = this.parseDateTime(endTime)

        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'Mei',
            'Jun',
            'Jul',
            'Agu',
            'Sep',
            'Okt',
            'Nov',
            'Des',
        ]

        if (
            start.getDate() === end.getDate() &&
            start.getMonth() === end.getMonth()
        ) {
            return `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}, ${this.formatTime(start)} - ${this.formatTime(end)}`
        }

        return `${start.getDate()}-${end.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }

    enterExam(examId: string, ukomType: ExamTypeCategory) {
        switch (ukomType) {
            case ExamTypeCategory.WAWANCARA:
                this.router.navigate(['/interviews', examId])
                break
            case ExamTypeCategory.MAKALAH:
            case ExamTypeCategory.SEMINAR:
                this.router.navigate(['/seminar-paper', examId])
                break
            case ExamTypeCategory.PORTOFOLIO:
                this.router.navigate(['/portfolio', examId])
                break
            case ExamTypeCategory.STUDI_KASUS:
                this.router.navigate(['/study-case', examId])
                break
            default:
                this.handlerService.handleAlert(
                    'Warning',
                    'Jenis Ukom tidak dikenali, Silahkan hubungi Admin',
                )
                break
        }
    }

    viewExamDetail(examId: string): void {
        // TODO: Navigate to exam detail page
        console.log('Viewing exam detail:', examId)
        // this.router.navigate(['/examiner/exam', examId, 'detail'])
    }

    toggleCompletedExams(): void {
        this.showCompletedExams.update((value) => !value)
    }

    toggleParticipantList(examId: string, exam: GroupedExam): void {
        if (this.showParticipantList() === examId) {
            this.showParticipantList.set(null)
            this.selectedExamForParticipants.set(null)
        } else {
            this.showParticipantList.set(examId)
            this.selectedExamForParticipants.set(exam)
        }
    }

    isParticipantListVisible(examId: string): boolean {
        return this.showParticipantList() === examId
    }

    getJenisUkomDisplay(jenisUkom: string): string {
        return this.jenisUkomService.getLabelByValue(jenisUkom) || jenisUkom
    }

    getParticipants(exam: GroupedExam) {
        return exam.schedule.participantScheduleList || []
    }
}
