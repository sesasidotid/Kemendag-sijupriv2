import { CommonModule } from '@angular/common'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { RoomUkom } from '@/modules/ukom/models/cat/room-ukom.model'
import { Router } from '@angular/router'
import { HandlerService } from '@/modules/base/services/handler.service'
import {
    catchError,
    concatMap,
    finalize,
    forkJoin,
    map,
    of,
    tap,
    timer,
} from 'rxjs'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { CATScore } from '@/modules/ukom/models/cat/cat-score'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { MakalahScore } from '@/modules/ukom/models/cat/makalah-score'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { ExamGradeService } from '@/modules/ukom/services/exam-grade.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ScoreValue } from '@/modules/ukom/models/cat/score-value.type'
import { CATIndicatorCompetency } from '@/modules/ukom/models/cat/cat-indicator-competency.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'
import { FormatExamSchedulePipe } from '@/modules/ukom/pipes/format-exam-schedule.pipe'
import { ExamDurationPipe } from '@/modules/ukom/pipes/exam-duration.pipe'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { ExamTypeHandlerService } from './exam-type-handler.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'

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
    imports: [
        CommonModule,
        ModalComponent,
        EmptyStateComponent,
        LoadingButtonComponent,
        FormatExamSchedulePipe,
        ExamDurationPipe,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
    participantService = inject(UkomParticipantService)
    examGradeService = inject(ExamGradeService)
    examService = inject(ExamService)
    examTypeHandler = inject(ExamTypeHandlerService)

    nowGmt7 = signal<string>(this.getNowGmt7String())

    isModalOpen = signal(false)
    selectedExamId = signal<string | null>(null)

    roomUkom = new RoomUkom()
    scoreMap: Record<string, ScoreValue | null> = {}

    roomLoading = signal(false)
    startCATLoading = signal(false)
    startMakalahLoading = signal(false)
    startWawancaraLoading = signal(false)
    startPraktikLoading = signal(false)
    startStudiKasusLoading = signal(false)
    startPortofolioLoading = signal(false)

    formattedCurrentDate = computed(() => {
        const raw = this.nowGmt7()
        const { year, month, day, hour, minute } = this.parseRawDate(raw)

        return `${day} ${MONTHS[month - 1]} ${year}, ${hour
            .toString()
            .padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    })
    protected readonly ExamTypeCategory = ExamTypeCategory

    constructor(
        private router: Router,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private filePreviewService: FilePreviewService,
    ) {}

    ngOnInit() {
        this.updateNowGmt7()
        this.loadExams()

        const now = new Date()
        const msUntilNextMinute =
            (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

        timer(msUntilNextMinute, 60000).subscribe(() => {
            this.updateNowGmt7()
        })
    }

    loadExams() {
        const userId = LoginContext.getUserId().replace('PU-', '')
        this.roomLoading.set(true)

        this.participantService
            .getParticipantUkom(userId)
            .pipe(
                tap((response) => {
                    const roomUkom = response.roomUkomDto

                    roomUkom.examScheduleDtoList = [
                        ...roomUkom.examScheduleDtoList,
                    ].sort(
                        (a, b) =>
                            new Date(a.startTime.replace(' ', 'T')).getTime() -
                            new Date(b.startTime.replace(' ', 'T')).getTime(),
                    )

                    this.roomUkom = roomUkom
                }),

                concatMap((participant) => this.getAllScores(participant)),

                finalize(() => this.roomLoading.set(false)),
            )
            .subscribe()
    }

    getAllScores(participant: Participant) {
        if (!participant) return of([])

        const requests = participant.roomUkomDto.examScheduleDtoList.map(
            (examSchedule) => {
                return this.examGradeService
                    .getExamGradeByExamScheduleIdAndParticipantId(
                        examSchedule.id,
                        participant.id,
                    )
                    .pipe(
                        catchError((err) => {
                            if (err.status === 404) {
                                return of(null)
                            }

                            return of(null)
                        }),
                        map((response) => {
                            const scoreInstance =
                                this.examTypeHandler.createScore(
                                    examSchedule.examTypeCode,
                                    response,
                                )

                            return { examSchedule, scoreInstance }
                        }),
                    )
            },
        )

        return forkJoin(requests).pipe(
            tap((results) => {
                results.forEach((result) => {
                    if (result?.examSchedule?.id) {
                        this.scoreMap[result.examSchedule.id] =
                            result.scoreInstance
                    }
                })
            }),
        )
    }

    getAbsoluteUrl(url: string): string {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`
        }
        return url
    }

    canStartExam(startTime: string, endTime?: string): boolean {
        const now = new Date()

        const toGMT7 = (dateStr: string): Date => {
            const [datePart, timePart] = dateStr.split(' ')
            const [year, month, day] = datePart.split('-').map(Number)
            const [hour, minute, second] = timePart.split(':').map(Number)

            return new Date(
                Date.UTC(year, month - 1, day, hour - 7, minute, second),
            )
        }

        const start = toGMT7(startTime)

        // If endTime is provided, check between start and end
        if (endTime) {
            const end = toGMT7(endTime)
            return start <= now && now <= end
        }

        // If no endTime, treat startTime as personalSchedule
        return start <= now
    }

    startExam(
        roomUkomId: string,
        examTypeCode: ExamTypeCategory,
        examScheduleId: string,
    ) {
        const examType = examTypeCode
        const config = this.examTypeHandler.getStartExamConfig(examType)

        this.confirmationService
            .open(
                config.withComment,
                config.title,
                config.message,
                config.commentLabel,
                undefined, // confirmButtonText (uses default 'Yakin')
                undefined, // cancelButtonText (uses default 'Batal')
                config.placeholder,
            )
            .subscribe({
                next: ({ confirmed, comment }) => {
                    if (!confirmed) return

                    const loadingSignal = this.examTypeHandler.getLoadingSignal(
                        examType,
                        {
                            startCATLoading: this.startCATLoading,
                            startMakalahLoading: this.startMakalahLoading,
                            startWawancaraLoading: this.startWawancaraLoading,
                            startPraktikLoading: this.startPraktikLoading,
                            startStudiKasusLoading: this.startStudiKasusLoading,
                            startPortofolioLoading: this.startPortofolioLoading,
                        },
                    )
                    loadingSignal?.set(true)

                    this.examService
                        .startExam(
                            examTypeCode,
                            roomUkomId,
                            examScheduleId,
                            comment,
                        )
                        .pipe(
                            finalize(() => {
                                loadingSignal?.set(false)
                            }),
                        )
                        .subscribe({
                            next: () => {
                                const route =
                                    this.examTypeHandler.getRoute(examType)

                                if (!route) {
                                    this.handlerService.handleAlert(
                                        'Error',
                                        `Jenis ujian tidak diketahui: ${examTypeCode}`,
                                    )
                                    return
                                }
                                this.router.navigate([
                                    `/${route}/${examScheduleId}`,
                                ])
                            },
                            error: (err) => {
                                if (err.error.message == 'Invalid Secret') {
                                    this.handlerService.handleAlert(
                                        'Error',
                                        'Kode ujian yang dimasukkan tidak valid.',
                                    )
                                    // } else if (
                                    //     err.error.message ==
                                    //     "Exam's not yet started"
                                    // ) {
                                    //     this.handlerService.handleAlert(
                                    //         'Error',
                                    //         'Ujian belum dimulai oleh penguji.',
                                    //     )
                                } else {
                                    this.handlerService.handleException(err)
                                }
                            },
                        })
                },
            })
    }

    toggleModal() {
        this.isModalOpen.set(!this.isModalOpen())
        if (!this.isModalOpen()) {
            this.selectedExamId.set(null)
        }
    }

    openScoreModal(examId: string) {
        this.selectedExamId.set(examId)
        this.toggleModal()
    }

    viewUploadedMakalah(examId: string) {
        const rawScore = this.scoreMap[examId]

        if (!(rawScore instanceof MakalahScore)) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file yang tersedia untuk ditampilkan.',
            )
            return
        }

        const answerDto = rawScore.questionDtoList[0]?.answerDto

        if (!answerDto) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file yang tersedia untuk ditampilkan.',
            )
            return
        }

        this.filePreviewService.open(
            answerDto.answerUpload,
            answerDto.answerUploadUrl,
        )
    }

    getGroupedCompetencies() {
        const examId = this.selectedExamId()
        if (!examId) return []

        const rawScore = this.scoreMap[examId]

        if (!rawScore) return []

        if (!(rawScore instanceof CATScore)) {
            return []
        }

        type GroupResult = {
            name: string
            items: typeof rawScore.kompetensiIndikatorDtoList
            total: number
            correct: number
        }

        const grouped = rawScore.kompetensiIndikatorDtoList.reduce(
            (acc, kompetensi) => {
                const key = kompetensi.kompetensiId
                acc[key] ??= {
                    name: kompetensi.kompetensiName ?? '-',
                    items: [],
                    total: 0,
                    correct: 0,
                }
                acc[key].items.push(kompetensi)
                acc[key].total += kompetensi.questionDtoList?.length ?? 0
                acc[key].correct += this.getCorrectAnswersCount(kompetensi)

                return acc
            },
            {} as Record<string, GroupResult>,
        )

        return Object.values(grouped).map((group) => ({
            ...group,
            percentage:
                group.total > 0
                    ? Math.round((group.correct / group.total) * 100)
                    : 0,
        }))
    }

    getCorrectAnswer(question: CATQuestions): string {
        const correctChoice = question.multipleChoiceDtoList.find(
            (choice) => choice.correct,
        )
        return correctChoice ? correctChoice.choiceId : ''
    }

    getCorrectAnswersCount(kompetensi: CATIndicatorCompetency): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return kompetensi.questionDtoList.filter(
            (question) =>
                question.answerDto?.answerChoice ===
                this.getCorrectAnswer(question),
        ).length
    }

    getExamDisplayName(examTypeCode: string): string {
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

    isExamExpired(endTime?: string): boolean {
        if (!endTime) return false

        const now = new Date()
        const end = this.parseToGmt7(endTime)

        return now > end
    }

    isExamNotStartedYet(startTime: string): boolean {
        const now = new Date()
        const start = this.parseToGmt7(startTime)

        return now < start
    }

    isPersonalScheduleExam(exam: ExamSchedule): boolean {
        return (
            exam.examTypeCode === ExamTypeCategory.WAWANCARA ||
            exam.examTypeCode === ExamTypeCategory.SEMINAR
        )
    }

    isExamScheduleHaveScore(examScheduleId: string) {
        const score = this.scoreMap[examScheduleId]
        return score !== null && score !== undefined
    }

    // Helper method for template - checks if exam has score
    hasScore(examScheduleId: string): boolean {
        return this.isExamScheduleHaveScore(examScheduleId)
    }

    isExamCompleted(exam: ExamSchedule): boolean {
        return (
            this.isExamExpired(exam.endTime) ||
            this.isExamScheduleHaveScore(exam.id)
        )
    }

    // New: Exam time is over but no score (missed/not answered)
    isExamMissed(exam: ExamSchedule): boolean {
        return (
            this.isExamExpired(exam.endTime) &&
            !this.isExamScheduleHaveScore(exam.id)
        )
    }

    isExamOngoing(exam: ExamSchedule): boolean {
        return (
            !this.hasScore(exam.id) &&
            !this.isExamExpired(exam.endTime) &&
            this.canStartExam(exam.startTime, exam.endTime)
        )
    }

    isExamUpcoming(exam: ExamSchedule): boolean {
        return (
            !this.hasScore(exam.id) &&
            !this.isExamExpired(exam.endTime) &&
            this.isExamNotStartedYet(exam.startTime)
        )
    }

    private parseToGmt7(dateStr: string): Date {
        const [datePart, timePart] = dateStr.split(' ')
        const [year, month, day] = datePart.split('-').map(Number)
        const [hour, minute, second] = timePart.split(':').map(Number)

        // dateStr is GMT+7 → convert to UTC internally
        return new Date(
            Date.UTC(year, month - 1, day, hour - 7, minute, second),
        )
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
}
