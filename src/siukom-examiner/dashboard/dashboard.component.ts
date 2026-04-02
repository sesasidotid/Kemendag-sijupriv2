import { CommonModule } from '@angular/common'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { LoginContext } from '@/modules/base/commons/login-context'
import { UkomExaminerService } from '@/modules/ukom/services/ukom-examiner.service'
import { EMPTY, finalize, forkJoin, map, switchMap, timer } from 'rxjs'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { Jenjang } from '@/modules/maintenance/models/jenjang.modle'
import { BidangJabatan } from '@/modules/maintenance/models/bidang-jabatan.model'

type ExamStatus = 'ongoing' | 'upcoming' | 'completed'

interface GroupedExam {
    schedule: ExamSchedule
    status: ExamStatus
    displayName: string
    participantCount: number
}

interface OngoingParticipant {
    participantScheduleId: string
    participantId: string
    participantName: string
    participantNip: string
    jenisUkom: string
    examId: string
    examTypeCode: ExamTypeCategory
    examDisplayName: string
    roomUkomId: string
    personalSchedule: string
    formattedSchedule: string
    roomUkom: RoomUkomDetail
}

const MONTHS = [
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

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    examinerId = LoginContext.getUserId()
    loadingExamSchedule = signal(false)
    // Participant list management
    showParticipantList = signal<string | null>(null)
    selectedExamForParticipants = signal<GroupedExam | null>(null)
    nowGmt7 = signal<string>(this.getNowGmt7String())
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
    // For others: exam started and not yet graded
    ongoingParticipantSchedules = computed<OngoingParticipant[]>(() => {
        const now = this.nowGmt7()
        const ongoingExams = this.ongoingExam()
        const result: OngoingParticipant[] = []

        ongoingExams.forEach((exam) => {
            const schedule = exam.schedule
            const examType = schedule.examTypeCode
            const duration = schedule.duration || 0 // duration in hours
            const durationMinutes = duration * 60

            const participants = schedule.participantScheduleList || []

            participants.forEach((pSchedule) => {
                const isReady = this.isParticipantReadyForExam(
                    pSchedule,
                    examType,
                    durationMinutes,
                    now,
                    schedule.startTime,
                )

                if (isReady) {
                    const personalTime =
                        pSchedule.personalSchedule || schedule.startTime

                    // Map codes to names for roomUkom
                    const mappedRoomUkom = this.mapRoomUkomCodesToNames(
                        schedule.roomUkom,
                    )

                    result.push({
                        participantScheduleId: pSchedule.id,
                        participantId: pSchedule.participantId,
                        participantName: pSchedule.participantUkom?.name,
                        participantNip: pSchedule.participantUkom?.nip,
                        jenisUkom: pSchedule.participantUkom?.jenisUkom,
                        examId: schedule.id,
                        examTypeCode: examType,
                        examDisplayName: exam.displayName,
                        roomUkomId: schedule.roomUkomId,
                        personalSchedule: personalTime,
                        formattedSchedule:
                            this.formatPersonalScheduleStart(personalTime),
                        roomUkom: mappedRoomUkom,
                    })
                }
            })
        })

        // Sort by personal schedule time (earliest first)
        return result.sort((a, b) =>
            a.personalSchedule.localeCompare(b.personalSchedule),
        )
    })
    // Format current date for display
    formattedCurrentDate = computed(() => {
        const raw = this.nowGmt7()
        const { year, month, day, hour, minute } = this.parseRawDate(raw)

        return `${day} ${MONTHS[month - 1]} ${year}, ${hour
            .toString()
            .padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    })
    // Reference data for mapping codes to names
    private jabatanList = signal<Jabatan[]>([])
    // Participants currently ready for examination
    // For WAWANCARA/SEMINAR/PRAKTIK: within personal schedule + duration window
    private jenjangList = signal<Jenjang[]>([])
    private bidangJabatanList = signal<BidangJabatan[]>([])
    private router = inject(Router)
    private jenisUkomService = inject(JenisUkomService)
    private handlerService = inject(HandlerService)
    private examScheduleService = inject(UkomExamScheduleService)
    private examinerService = inject(UkomExaminerService)
    private jabatanService = inject(JabatanService)
    private jenjangService = inject(JenjangService)
    private bidangJabatanService = inject(BidangJabatanService)

    private schedules = signal<ExamSchedule[]>([])

    ngOnInit(): void {
        this.updateNowGmt7()
        this.fetchReferenceData()
        this.fetchExaminerSchedule()

        const now = new Date()
        const msUntilNextMinute =
            (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

        timer(msUntilNextMinute, 60000).subscribe(() => {
            this.updateNowGmt7()
        })
    }

    /**
     * Fetch reference data for mapping codes to names
     */
    fetchReferenceData(): void {
        forkJoin({
            jabatan: this.jabatanService.findAll(),
            jenjang: this.jenjangService.findAll(),
            bidangJabatan: this.bidangJabatanService.findAll(),
        }).subscribe({
            next: (result) => {
                this.jabatanList.set(result.jabatan)
                this.jenjangList.set(result.jenjang)
                this.bidangJabatanList.set(result.bidangJabatan)
            },
            error: (err) => {
                console.error('Error fetching reference data:', err)
            },
        })
    }

    fetchExaminerSchedule(): void {
        this.loadingExamSchedule.set(true)

        this.examinerService
            .searchExaminerV2({ userId: this.examinerId })
            .pipe(
                switchMap((res) => {
                    const id = res.data[0]?.id
                    return id
                        ? this.examScheduleService.getExamByExaminerId(id)
                        : EMPTY
                }),
                map((exams) =>
                    exams.filter(
                        (exam) =>
                            Array.isArray(exam.participantScheduleList) &&
                            exam.participantScheduleList.length > 0,
                    ),
                ),
                finalize(() => this.loadingExamSchedule.set(false)),
                // map((exams) =>
                //     exams.filter(
                //         (exam) =>
                //             exam.examTypeCode !== ExamTypeCategory.MAKALAH,
                //     ),
                // ),
            )
            .subscribe({
                next: (res) => this.schedules.set(res),
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat jadwal ujian. Silahkan coba lagi nanti.',
                    )
                },
            })
    }

    enterExam(
        participantId: string,
        examId: string,
        ukomType: ExamTypeCategory,
        roomUkomId: string,
    ) {
        switch (ukomType) {
            case ExamTypeCategory.WAWANCARA:
                this.router.navigate(['/interviews', examId, participantId])
                break
            case ExamTypeCategory.MAKALAH:
                this.router.navigate(['/paper', examId, participantId])
                break
            case ExamTypeCategory.SEMINAR:
                this.router.navigate(['/seminar-paper', examId, participantId])
                break
            case ExamTypeCategory.PORTOFOLIO:
                this.router.navigate(['/portfolio', examId, participantId])
                break
            case ExamTypeCategory.STUDI_KASUS:
                this.router.navigate(['/case-study', examId, participantId])
                break
            case ExamTypeCategory.PRAKTIK:
                this.router.navigate(['/practical-work', examId, participantId])
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

    /**
     * Check if a participant has been examined
     * Now checks the examined field on each participant in participantScheduleList
     */
    isParticipantExamined(
        exam: GroupedExam,
        participantSchedule: any,
    ): boolean {
        // Check the examined field on the participant schedule object
        return participantSchedule?.examined === true
    }

    getParticipants(exam: GroupedExam) {
        const participants = exam.schedule.participantScheduleList || []
        // Map roomUkom codes to names for each participant
        const mappedRoomUkom = this.mapRoomUkomCodesToNames(
            exam.schedule.roomUkom,
        )

        // Add the mapped roomUkom to each participant for display
        return participants.map((p) => ({
            ...p,
            roomUkom: mappedRoomUkom,
        }))
    }

    enterExamFromOngoing(participant: OngoingParticipant): void {
        this.enterExam(
            participant.participantId,
            participant.examId,
            participant.examTypeCode,
            participant.roomUkomId,
        )
    }

    getParticipantScheduleTime(pSchedule: any, exam: GroupedExam): string {
        const time = pSchedule.personalSchedule ?? exam.schedule.startTime

        return this.formatPersonalScheduleStart(time) + ' (WIB)'
    }

    formatDateRange(startTime: string, endTime: string): string {
        const start = this.parseRawDate(startTime)
        const end = this.parseRawDate(endTime)

        const formatDate = (d: typeof start) =>
            `${d.day} ${MONTHS[d.month - 1]} ${d.year}`

        const formatTime = (d: typeof start) =>
            `${d.hour.toString().padStart(2, '0')}:${d.minute
                .toString()
                .padStart(2, '0')}`

        const formatDateTime = (d: typeof start) =>
            `${formatDate(d)}, ${formatTime(d)}`

        // Same day - show date once with time range
        if (
            start.year === end.year &&
            start.month === end.month &&
            start.day === end.day
        ) {
            return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(
                end,
            )} WIB`
        }

        // Different days - show full date-time for both start and end
        return `${formatDateTime(start)} - ${formatDateTime(end)} WIB`
    }

    formatPersonalScheduleStart(startTime: string): string {
        const { year, month, day, hour, minute } = this.parseRawDate(startTime)

        return `${day} ${MONTHS[month - 1]} ${year}, ${hour
            .toString()
            .padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }

    /**
     * Check if participant is ready for examination based on exam type
     * - WAWANCARA/SEMINAR/PRAKTIK: current time is within personal schedule + duration
     * - Others: exam has started and participant not yet examined
     */
    private isParticipantReadyForExam(
        pSchedule: any,
        examType: ExamTypeCategory,
        durationMinutes: number,
        now: string,
        examStartTime: string,
    ): boolean {
        const personalSchedule = pSchedule.personalSchedule
        const isExamined = pSchedule.examined === true

        // For WAWANCARA, PRAKTIK and SEMINAR:
        // Must have personal schedule
        // Must be within schedule window
        // Must NOT already be examined
        if (this.isPersonalScheduleWindowExam(examType)) {
            if (!personalSchedule || isExamined) {
                return false
            }

            const scheduleEnd = this.addMinutesToDateTime(
                personalSchedule,
                durationMinutes,
            )

            return now >= personalSchedule && now <= scheduleEnd
        }

        // For PORTOFOLIO, STUDI_KASUS, MAKALAH:
        // Must have exam started
        // Must NOT already be examined
        const isExamStarted = now >= examStartTime

        return isExamStarted && !isExamined
    }

    private isPersonalScheduleWindowExam(
        examType: ExamTypeCategory,
    ): boolean {
        return (
            examType === ExamTypeCategory.WAWANCARA ||
            examType === ExamTypeCategory.SEMINAR ||
            examType === ExamTypeCategory.PRAKTIK
        )
    }

    /**
     * Add minutes to a datetime string and return new datetime string
     */
    private addMinutesToDateTime(dateTimeStr: string, minutes: number): string {
        const { year, month, day, hour, minute, second } =
            this.parseRawDate(dateTimeStr)

        // Create date in local context
        const date = new Date(year, month - 1, day, hour, minute, second)
        date.setMinutes(date.getMinutes() + minutes)

        const yyyy = date.getFullYear()
        const mm = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')
        const hh = date.getHours().toString().padStart(2, '0')
        const mi = date.getMinutes().toString().padStart(2, '0')
        const ss = date.getSeconds().toString().padStart(2, '0')

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
    }

    private groupExamsByStatus(): GroupedExam[] {
        const now = this.nowGmt7()
        const grouped: GroupedExam[] = []

        this.schedules().forEach((schedule) => {
            const startTime = schedule.startTime
            const endTime = schedule.endTime

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

        return grouped.sort((a, b) => {
            if (a.status === 'ongoing' && b.status !== 'ongoing') return -1
            if (a.status !== 'ongoing' && b.status === 'ongoing') return 1

            if (a.status === 'upcoming' && b.status === 'upcoming') {
                return a.schedule.startTime.localeCompare(b.schedule.startTime)
            }

            if (a.status === 'completed' && b.status === 'completed') {
                return b.schedule.endTime.localeCompare(a.schedule.endTime)
            }

            return 0
        })
    }

    private updateNowGmt7(): void {
        this.nowGmt7.set(this.getNowGmt7String())
    }

    private getNowGmt7String(): string {
        const now = new Date() // ✅ system clock only

        // Convert local time → UTC
        const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000

        // Add GMT+7 offset
        const gmt7 = new Date(utcMillis + 7 * 60 * 60000)

        const yyyy = gmt7.getFullYear()
        const mm = (gmt7.getMonth() + 1).toString().padStart(2, '0')
        const dd = gmt7.getDate().toString().padStart(2, '0')
        const hh = gmt7.getHours().toString().padStart(2, '0')
        const mi = gmt7.getMinutes().toString().padStart(2, '0')
        const ss = gmt7.getSeconds().toString().padStart(2, '0')

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
    }

    private parseRawDate(dateTimeStr: string) {
        const [datePart, timePart] = dateTimeStr.split(' ')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hour, minute, second] = timePart.split(':').map(Number)

        return { year, month, day, hour, minute, second }
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

    /**
     * Map jabatan, jenjang, and bidang jabatan codes to their names
     */
    private mapRoomUkomCodesToNames(
        roomUkom: RoomUkomDetail | null | undefined,
    ): RoomUkomDetail {
        if (!roomUkom) {
            return new RoomUkomDetail()
        }

        const mappedRoomUkom = new RoomUkomDetail(roomUkom)

        // Map jabatan code to name
        if (roomUkom.jabatanCode) {
            const jabatan = this.jabatanList().find(
                (j) => j.code === roomUkom.jabatanCode,
            )
            if (jabatan) {
                mappedRoomUkom.jabatanName = jabatan.name
            }
        }

        // Map jenjang code to name
        if (roomUkom.jenjangCode) {
            const jenjang = this.jenjangList().find(
                (j) => j.code === roomUkom.jenjangCode,
            )
            if (jenjang) {
                mappedRoomUkom.jenjangName = jenjang.name
            }
        }

        // Map bidang jabatan code to name
        if (roomUkom.bidangJabatanCode) {
            const bidangJabatan = this.bidangJabatanList().find(
                (bj) => bj.code === roomUkom.bidangJabatanCode,
            )
            if (bidangJabatan) {
                mappedRoomUkom.bidangJabatanName = bidangJabatan.name
            }
        }

        return mappedRoomUkom
    }
}
