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
    // Participant list management
    showParticipantList = signal<string | null>(null)
    selectedExamForParticipants = signal<GroupedExam | null>(null)
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

        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date)
    })
    private router = inject(Router)
    private jenisUkomService = inject(JenisUkomService)
    private handlerService = inject(HandlerService)
    // Dummy data - replace with actual API call
    private schedules = signal<ExamSchedule[]>([
        new ExamSchedule({
            id: '36c814b0-653f-4474-99b4-827731aa57d3',
            startTime: '2025-12-30 10:30:00',
            endTime: '2025-12-30 12:00:00',
            duration: 0.5,
            examTypeCode: ExamTypeCategory.WAWANCARA,
            roomUkomId: 'b54e37a3-bcf9-4158-82f6-8b2fcc7103b0',
            secretKey: null,
            participantScheduleList: [
                {
                    id: 'psl-1',
                    participantId: 'participant-1',
                    examScheduleId: '36c814b0-653f-4474-99b4-827731aa57d3',
                    personalSchedule: null,
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
    ])

    constructor() {}
    ngOnInit(): void {
        // Update current time every minute
        setInterval(() => {
            this.currentDate.set(new Date())
        }, 60000)
    }

    formatDateRange(startTime: string, endTime: string): string {
        const start = this.parseDateTime(startTime)
        const end = this.parseDateTime(endTime)

        const dateFormatter = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })

        const dayMonthFormatter = new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
        })

        if (
            start.getDate() === end.getDate() &&
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return `${dateFormatter.format(start)}, ${this.formatTime(start)} - ${this.formatTime(end)}`
        }

        if (
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return `${start.getDate()}–${end.getDate()} ${dayMonthFormatter.format(start).replace(start.getDate().toString(), '').trim()} ${start.getFullYear()}`
        }

        return `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`
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

    private groupExamsByStatus(): GroupedExam[] {
        const now = this.currentDate()
        console.log('now', now)
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

        // Create date as if it's UTC+7, then subtract 7 hours
        const utcMillis = Date.UTC(
            year,
            month - 1,
            day,
            hour - 7,
            minute,
            second,
        )

        console.log('utcMillis', new Date(utcMillis))

        return new Date(utcMillis)
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

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${hours}:${minutes}`
    }
}
