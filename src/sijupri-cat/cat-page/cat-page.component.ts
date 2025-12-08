import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { Component, effect, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LoginContext } from '@/modules/base/commons/login-context'
import { RoomUkom } from '@/modules/ukom/models/cat/room-ukom.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { Router, RouterModule } from '@angular/router'
import {
    BehaviorSubject,
    combineLatest,
    EMPTY,
    finalize,
    map,
    Observable,
    startWith,
    Subject,
    switchMap,
} from 'rxjs'
import { ReactiveFormsModule } from '@angular/forms'
import { HostListener } from '@angular/core'
import { ExamAttendance } from '@/modules/ukom/models/cat/exam-attendance'
import { CatService } from '@/modules/ukom/services/cat.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { CatExamSecurityService } from './cat-exam-security.service'
import { CatExamTimerService } from './cat-exam-timer.service'
import { CatAnswerService } from './cat-answer.service'
import { DisableRightClickDirective } from './disable-right-click.directive'
import { DisableKeyboardShortcutsDirective } from './disable-keyboard-shortcuts.directive'

@Component({
    selector: 'app-cat-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DisableRightClickDirective,
        DisableKeyboardShortcutsDirective,
        RouterModule,
    ],
    templateUrl: './cat-page.component.html',
    styleUrl: './cat-page.component.scss',
})
export class CatPageComponent {
    // Services
    catService = inject(CatService)
    private participantService = inject(UkomParticipantService)
    private handler = inject(HandlerService)
    private confirmationService = inject(ConfirmationService)
    private router = inject(Router)

    // Feature services
    securityService = inject(CatExamSecurityService)
    private timerService = inject(CatExamTimerService)
    private answerService = inject(CatAnswerService)

    // Constants
    readonly EXAM_TYPE = 'CAT'
    readonly userID = LoginContext.getUserId()

    // Data models
    data: CATQuestions[] = []
    roomUkom = new RoomUkom()
    pesertaUkom = new Participant()
    examAttendance = new ExamAttendance()

    // Exam state
    examEndTime: Date | null = null
    isLoadingRoomUkom$ = new BehaviorSubject<boolean>(false)

    // Computed & reactive properties from services
    currentPage = this.answerService.currentPage
    totalQuestions = this.answerService.totalQuestions
    selectedAnswer = this.answerService.selectedAnswer
    savedAnswer = this.answerService.savedAnswer
    flaggedQuestions = this.answerService.flaggedQuestions
    isSavingAnswer$ = this.answerService.isSavingAnswer$
    isSubmittingAnswer$ = this.answerService.isSubmittingAnswer$

    remainingTime = this.timerService.remainingTime
    remainingSeconds = this.timerService.remainingSeconds

    showWarning = this.securityService.showWarning
    violationCount = this.securityService.violationCount
    isFullscreen = this.securityService.isFullscreen
    isSubmitted = this.securityService.isSubmitted
    violationPanelOpen = false
    private violationPanelPinned = false
    private violationAutoCloseTimer?: ReturnType<typeof setTimeout>

    isLoading$: Observable<boolean>

    private destroy$ = new Subject<void>()

    constructor() {
        this.isLoading$ = combineLatest([
            this.isLoadingRoomUkom$.pipe(startWith(true)),
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))

        effect(
            () => {
                if (this.isSubmitted()) {
                    this.showWarning.set(false)
                }
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {
        this.securityService.initializeSecurity(() => this.submitAnswer(false))
        this.getRoomUkom()
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
        this.securityService.cleanup()
        this.timerService.cleanup()
        this.clearViolationAutoClose()
    }

    // ========== Host Listeners for Security ==========

    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent) {
        // Check if this is a tab close (not a reload)
        const isReload =
            (event.currentTarget as Window)?.performance?.navigation?.type === 1

        if (!isReload && !this.isSubmitted()) {
            // User is closing the tab - send beacon
            this.securityService.sendTabCloseBeacon(
                this.EXAM_TYPE,
                this.roomUkom.id,
                this.pesertaUkom.id,
            )
        }

        this.securityService.markUnloading()
    }

    @HostListener('document:visibilitychange', [])
    handleVisibilityChange() {
        this.securityService.handleVisibilityChange()
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.securityService.handleMouseMove(event)
    }

    @HostListener('window:blur', [])
    onBlur() {
        this.securityService.handleBlur()
    }

    @HostListener('document:fullscreenchange', [])
    handleFullscreenChange() {
        this.securityService.handleFullscreenExit()
    }

    backWithConfirmation() {
        const title = 'Konfirmasi Kembali'
        const message =
            'Apakah Anda yakin ingin kembali? Semua jawaban akan disimpan.'

        this.confirmationService.open(false, title, message).subscribe({
            next: ({ confirmed }) => {
                if (confirmed) {
                    this.router.navigate(['/'])
                }
            },
            error: (err) => {
                console.error('Error during confirmation:', err)
            },
        })
    }

    // ========== Question Navigation ==========

    navigateToPage(page: number) {
        this.answerService.navigateToPage(page)
    }

    toggleFlag(questionId: string) {
        this.answerService.toggleFlag(questionId)
    }

    isFlagged(questionId: string): boolean {
        return this.answerService.isFlagged(questionId)
    }

    // ========== Answer Management ==========

    selectAnswer(questionId: string, choiceId: string) {
        this.answerService.selectAnswer(questionId, choiceId)
    }

    onSaveButtonClick(questionId: string) {
        const isFlagged = this.answerService.isFlagged(questionId)
        this.answerService
            .saveAnswer(
                questionId,
                this.pesertaUkom.id,
                isFlagged,
                this.securityService.examScheduleId,
            )
            .subscribe({
                next: () => {},
                error: (err) => {
                    console.error('Error saving answer:', err)
                    this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
                },
            })
    }

    submitAfterSave(questionId: string) {
        this.answerService
            .saveAndSubmitExam(
                questionId,
                this.pesertaUkom.id,
                this.EXAM_TYPE,
                this.roomUkom.id,
                this.securityService.examScheduleId,
            )
            .subscribe({
                next: () => {
                    this.securityService.clearViolations()
                    this.securityService.markSubmitted()
                    this.securityService.exitFullScreen()
                    this.router.navigate(['/'])
                },
                error: (err) => {
                    console.error('Error submitting exam:', err)
                    this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
                },
            })
    }

    submitAnswer(openDialog: boolean = true) {
        this.answerService
            .submitExam(
                this.EXAM_TYPE,
                this.roomUkom.id,
                this.securityService.examScheduleId,
                openDialog,
            )
            .subscribe({
                next: () => {
                    this.securityService.clearViolations()
                    this.securityService.markSubmitted()
                    this.router.navigate(['/'])
                },
                error: (err) => {
                    console.error('Error submitting exam:', err)
                    this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
                },
            })
    }

    // ========== Data Loading ==========

    getRoomUkom() {
        this.isLoadingRoomUkom$.next(true)
        const nip = this.userID.replace('PU-', '')

        this.participantService
            .getParticipantUkom(nip)
            .pipe(
                switchMap((participantUkom) => {
                    this.pesertaUkom = participantUkom
                    this.roomUkom = participantUkom.roomUkomDto

                    const catSchedule =
                        participantUkom.roomUkomDto?.examScheduleDtoList?.find(
                            (e) => e.examTypeCode === this.EXAM_TYPE,
                        )

                    if (catSchedule?.id) {
                        this.securityService.setExamScheduleId(catSchedule.id)
                    }

                    if (!catSchedule?.endTime) {
                        this.handler.handleAlert(
                            'Error',
                            'Informasi waktu berakhir ujian CAT tidak ditemukan.',
                        )
                        this.securityService.markSubmitted()
                        return EMPTY
                    }

                    this.examEndTime = this.catService.parseServerDate(
                        catSchedule.endTime,
                    )

                    return this.catService.getExamAttendance(
                        catSchedule.id,
                        participantUkom.id,
                    )
                }),
                finalize(() => this.isLoadingRoomUkom$.next(false)),
            )
            .subscribe({
                next: (attendance) => {
                    this.examAttendance = attendance
                    if (this.examAttendance.startAt) {
                        this.examAttendance.startAt = this.catService
                            .parseServerDate(this.examAttendance.startAt)
                            .toISOString()
                    }

                    this.securityService.setInitialState(
                        this.examAttendance.violationCount || 0,
                        this.examAttendance.mouseAwayCount || 0,
                    )

                    // Start timer
                    if (this.examEndTime) {
                        this.timerService.startCountdown(
                            this.examEndTime,
                            this.examAttendance.startAt,
                            this.examAttendance.duration,
                            () => this.submitAnswer(false),
                        )
                    }

                    // Load questions
                    this.getQuestion()
                },
                error: () => {
                    this.handler.handleAlert(
                        'Error',
                        'Gagal mengambil data kehadiran, silahkan refresh halaman atau hubungi panitia',
                    )
                },
            })
    }

    getQuestion() {
        this.answerService
            .loadQuestions(this.securityService.examScheduleId)
            .pipe(
                switchMap((response) => {
                    this.data = response.data
                    return this.answerService.fetchExamState(
                        this.EXAM_TYPE,
                        this.roomUkom.id,
                    )
                }),
            )
            .subscribe({
                next: (states) => {
                    const localFlags = new Set(
                        this.answerService.flaggedQuestions(),
                    )

                    if (Array.isArray(states)) {
                        states.forEach((s) => {
                            if (s.isUncertain) {
                                localFlags.add(s.questionId)
                            }
                        })
                    }

                    this.answerService.flaggedQuestions.set(localFlags)
                    // Save merged flags to localStorage
                    this.answerService.saveFlaggedToLocalStorage()
                },
                error: (err) => {
                    if (err.error.message === `Exam's already ended`) {
                        this.securityService.markSubmitted()
                    } else {
                        this.handler.handleAlert(
                            'Error',
                            'Gagal mengambil pertanyaan',
                        )
                    }
                },
            })
    }

    formatRemaining() {
        let total = this.remainingSeconds()

        const days = Math.floor(total / 86400)
        total %= 86400

        const hours = Math.floor(total / 3600)
        total %= 3600

        const minutes = Math.floor(total / 60)
        const seconds = total % 60

        return { days, hours, minutes, seconds }
    }

    padTime(value: number) {
        const safeValue = Math.max(0, value)
        return safeValue.toString().padStart(2, '0')
    }

    toggleViolationPanel() {
        if (this.violationPanelOpen && this.violationPanelPinned) {
            this.closeViolationPanel()
            return
        }

        if (this.violationPanelOpen) {
            this.violationPanelPinned = false
            this.closeViolationPanel()
        } else {
            this.violationPanelPinned = true
            this.openViolationPanel(false)
        }
    }

    closeViolationPanel() {
        this.clearViolationAutoClose()
        this.violationPanelOpen = false
        this.violationPanelPinned = false
    }

    private openViolationPanel(auto = false) {
        this.violationPanelOpen = true
        this.clearViolationAutoClose()

        if (auto) {
            this.violationAutoCloseTimer = setTimeout(() => {
                if (!this.violationPanelPinned) {
                    this.violationPanelOpen = false
                }
                this.clearViolationAutoClose()
            }, 5000)
        }
    }

    private clearViolationAutoClose() {
        if (this.violationAutoCloseTimer) {
            clearTimeout(this.violationAutoCloseTimer)
            this.violationAutoCloseTimer = undefined
        }
    }

    remainingViolations() {
        return Math.max(
            0,
            this.securityService.MAX_VIOLATIONS - this.violationCount(),
        )
    }
}
