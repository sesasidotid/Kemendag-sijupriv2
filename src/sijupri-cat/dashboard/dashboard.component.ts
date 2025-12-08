import { CommonModule } from '@angular/common'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Component, inject, signal } from '@angular/core'
import { RoomUkom } from '@/modules/ukom/models/cat/room-ukom.model'
import { Router } from '@angular/router'
import { HandlerService } from '@/modules/base/services/handler.service'
import {
    forkJoin,
    map,
    Observable,
    of,
    tap,
    combineLatest,
    finalize,
    concatMap,
    catchError,
} from 'rxjs'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { CATScore } from '@/modules/ukom/models/cat/cat-score'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { BehaviorSubject } from 'rxjs'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { ExamType } from '@/modules/ukom/models/exam-type.model'
import { MakalahScore } from '@/modules/ukom/models/cat/makalah-score'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { ExamGradeService } from '@/modules/ukom/services/exam-grade.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ScoreValue } from '@/modules/ukom/models/cat/score-value.type'
import { CATIndicatorCompetency } from '@/modules/ukom/models/cat/cat-indicator-competency.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'
import { FormatExamSchedulePipe } from '@/modules/ukom/pipes/format-exam-schedule.pipe'

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        ModalComponent,
        EmptyStateComponent,
        LoadingButtonComponent,
        FormatExamSchedulePipe,
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    participantService = inject(UkomParticipantService)
    examGradeService = inject(ExamGradeService)
    examService = inject(ExamService)

    isModalOpen = signal(false)
    initialOpenAccordion = signal<string | null>(null)

    roomUkom = new RoomUkom()
    examType: ExamType[] = []

    scoreMap: Record<string, ScoreValue | null> = {}

    isRoomLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isStartCATLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isMakalahLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    constructor(
        private router: Router,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private filePreviewService: FilePreviewService,
    ) {
        this.isLoading$ = combineLatest([this.isRoomLoading$]).pipe(
            map((loadings) => loadings.some((isLoading) => isLoading)),
        )
    }

    ngOnInit() {
        this.loadExams()
    }

    loadExams() {
        const userId = LoginContext.getUserId().replace('PU-', '')

        this.isRoomLoading$.next(true)
        this.participantService
            .getParticipantUkom(userId)
            .pipe(
                tap((response) => {
                    this.roomUkom = response.roomUkomDto
                }),

                concatMap((participant) =>
                    this.getExamType().pipe(
                        map((examType) => ({ participant, examType })),
                    ),
                ),

                concatMap(({ participant, examType }) =>
                    this.getAllScores(participant, examType),
                ),

                finalize(() => this.isRoomLoading$.next(false)),
            )
            .subscribe()
    }

    getExamType() {
        return this.ukomMiscellaneousService
            .getExamType()
            .pipe(tap((examType) => (this.examType = examType)))
    }

    getAllScores(participant: Participant, examType: ExamType[]) {
        if (!participant || !examType) return of([])

        const requests = examType.map((type) => {
            const examCode = type.code

            return this.examGradeService
                .getExamGradeByCodeAndParticipantId(examCode, participant.id)
                .pipe(
                    catchError((err) => {
                        if (err.status === 404) {
                            // Expected missing score → return null, but don't error
                            return of({ examCode, scoreInstance: null })
                        }

                        // Any unexpected error should NOT break forkJoin
                        console.error(`Unexpected error for ${examCode}`, err)
                        return of({ examCode, scoreInstance: null })
                    }),
                    map((response) => {
                        let scoreInstance

                        switch (examCode) {
                            case 'CAT':
                                scoreInstance = new CATScore(response)
                                break
                            case 'MAKALAH':
                                scoreInstance = new MakalahScore(response)
                                break
                            default:
                                scoreInstance = response
                        }

                        return { examCode, scoreInstance }
                    }),
                )
        })

        return forkJoin(requests).pipe(
            tap((results) => {
                results.forEach((result) => {
                    if (result?.examCode) {
                        this.scoreMap[result.examCode] = result.scoreInstance
                    }
                })
                // Set which accordion should be initially open
                this.setInitialOpenAccordion()
            }),
        )
    }

    getAbsoluteUrl(url: string): string {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`
        }
        return url
    }

    canStartExam(startTime: string, endTime: string): boolean {
        const now = new Date()

        const toGMT7 = (dateStr: string): Date => {
            const [datePart, timePart] = dateStr.split(' ')
            const [year, month, day] = datePart.split('-').map(Number)
            const [hour, minute, second] = timePart.split(':').map(Number)

            return new Date(
                Date.UTC(year, month - 1, day, hour - 7, minute, second),
            )
        }

        return toGMT7(startTime) <= now && now <= toGMT7(endTime)
    }

    startExam(
        roomUkomId: string,
        examTypeCode: string,
        examScheduleId: string,
    ) {
        let title: string
        let message: string
        let commentLabel: string | undefined
        let placeholder: string | undefined
        let withComment: boolean

        if (examTypeCode === 'CAT') {
            withComment = true
            title = 'Konfirmasi Mulai Ujian CAT'
            message =
                'Anda akan memulai ujian CAT ini. Silakan masukkan kode ujian untuk melanjutkan. Pastikan semua persiapan sudah selesai.'
            commentLabel = 'Kode Ujian'
            placeholder = 'Masukkan kode ujian di sini...'
        } else {
            withComment = false
        }

        this.confirmationService
            .open(
                withComment,
                title,
                message,
                commentLabel,
                undefined, // confirmButtonText (uses default 'Yakin')
                undefined, // cancelButtonText (uses default 'Batal')
                placeholder, // Pass the conditional placeholder
            )
            .subscribe({
                next: ({ confirmed, comment }) => {
                    if (!confirmed) return

                    if (examTypeCode === 'CAT') {
                        this.isStartCATLoading$.next(true)
                    }
                    if (examTypeCode === 'MAKALAH') {
                        this.isMakalahLoading$.next(true)
                    }

                    this.examService
                        .startExam(
                            examTypeCode,
                            roomUkomId,
                            examScheduleId,
                            comment,
                        )
                        .pipe(
                            finalize(() => {
                                this.isStartCATLoading$.next(false)
                                this.isMakalahLoading$.next(false)
                            }),
                        )
                        .subscribe({
                            next: () => {
                                if (examTypeCode) {
                                    this.router.navigate([
                                        `/${examTypeCode.toLowerCase()}`,
                                    ])
                                }
                            },
                            error: (err) => {
                                if (err.error.message == 'Invalid Secret') {
                                    this.handlerService.handleAlert(
                                        'Error',
                                        'Kode ujian yang dimasukkan tidak valid.',
                                    )
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
    }

    viewUploadedMakalah() {
        const rawScore = this.scoreMap['MAKALAH']

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
        const rawScore = this.scoreMap['CAT']

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

    getWrongAnswersCount(kompetensi: CATIndicatorCompetency): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return (
            kompetensi.questionDtoList.length -
            this.getCorrectAnswersCount(kompetensi)
        )
    }

    /**
     * Determine which accordion should be initially open
     * Opens the first exam that hasn't been completed yet
     */
    setInitialOpenAccordion() {
        if (!this.roomUkom?.examScheduleDtoList?.length) {
            this.initialOpenAccordion.set(null)
            return
        }

        // Find first exam that hasn't been completed
        for (const exam of this.roomUkom.examScheduleDtoList) {
            const score = this.scoreMap[exam.examTypeCode]
            const isCompleted =
                score?.score !== null && score?.score !== undefined

            if (!isCompleted) {
                this.initialOpenAccordion.set(exam.examTypeCode)
                return
            }
        }

        // If all exams are completed, open the first one
        this.initialOpenAccordion.set(
            this.roomUkom.examScheduleDtoList[0].examTypeCode,
        )
    }

    /**
     * Check if an accordion should be initially open
     */
    isInitiallyOpen(examTypeCode: string): boolean {
        return this.initialOpenAccordion() === examTypeCode
    }
}
