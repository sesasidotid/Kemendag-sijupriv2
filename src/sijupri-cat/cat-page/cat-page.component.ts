import { Component, OnInit } from '@angular/core'
import { ApiService } from '../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { LoginContext } from '../../modules/base/commons/login-context'
import { RoomUkom } from '../../modules/ukom/models/cat/roomukom'
import { CATQuestions } from '../../modules/ukom/models/cat/cat-questions'
import { PesertaUkom } from '../../modules/ukom/models/peserta-ukom.model'
import { HandlerService } from '../../modules/base/services/handler.service'
import { ConfirmationService } from '../../modules/base/services/confirmation.service'
import { ConfirmationDialogComponent } from '../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { Router } from '@angular/router'
import {
    BehaviorSubject,
    combineLatest,
    filter,
    finalize,
    map,
    Observable,
    Subject,
    switchMap,
    take,
    takeUntil,
    tap,
    throwError
} from 'rxjs'
import { ReactiveFormsModule } from '@angular/forms'
import { HostListener } from '@angular/core'
import { ExamAttendance } from '../../modules/ukom/models/cat/exam-attendance'
@Component({
    selector: 'app-cat-page',
    standalone: true,
    imports: [CommonModule, ConfirmationDialogComponent, ReactiveFormsModule],
    templateUrl: './cat-page.component.html',
    styleUrl: './cat-page.component.scss'
})
export class CatPageComponent {
    data: CATQuestions = new CATQuestions()
    cat: string = 'CAT'
    room_id: string = ''
    roomUkom: RoomUkom = new RoomUkom()
    pesertaUkom: PesertaUkom = new PesertaUkom()
    examAttendance: ExamAttendance = new ExamAttendance()

    currentPage: number = 1
    totalQuestions: number = 0
    selectedAnswer: { [questionId: string]: string } = {}
    savedAnswer: { [questionId: string]: string } = {}

    examEndTime: Date | null = null
    remainingTime: string = ''
    remainingSeconds: number = 0
    isSubmitted$ = new BehaviorSubject<boolean>(false)
    showWarning: boolean = false
    warningCountdown: number = 30

    private warningInterval: any
    private countdownInterval: any
    private isInside = true
    private destroy$ = new Subject<void>()

    isSavingAnswer$ = new BehaviorSubject<boolean>(false)
    isSubmittingAnswer$ = new BehaviorSubject<boolean>(false)
    isLoadingRoomUkom$ = new BehaviorSubject<boolean>(true)

    isLoading$: Observable<boolean>

    constructor (
        private api: ApiService,
        private handler: HandlerService,
        private confirmationService: ConfirmationService,
        private router: Router
    ) {
        this.isLoading$ = combineLatest([this.isLoadingRoomUkom$]).pipe(
            map(loadings => loadings.some(isLoading => isLoading))
        )
    }

    ngOnInit () {
        this.getRoomUkom()
        this.enterFullScreen()
        this.isSubmitted$
            .pipe(takeUntil(this.destroy$))
            .subscribe(submitted => {
                if (submitted) {
                    this.showWarning = false
                }
            })
    }

    @HostListener('document:visibilitychange', [])
    handleVisibilityChange () {
        if (document.hidden) {
        }
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove (event: MouseEvent) {
        if (this.isSubmitted$.value) return

        const inside = this.isMouseInsideExamArea(event)

        if (inside !== this.isInside) {
            this.isInside = inside

            if (!inside) {
                this.showWarning = true
                this.startWarningCountdown()
            } else {
                this.showWarning = false
                this.resetWarningCountdown()
            }
        }
    }

    isMouseInsideExamArea (event: MouseEvent): boolean {
        const examArea = document.querySelector('.parent') as HTMLElement
        if (!examArea) return false

        const rect = examArea.getBoundingClientRect()
        return (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        )
    }

    startWarningCountdown () {
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }

        this.warningCountdown = 30
        this.warningInterval = setInterval(() => {
            this.warningCountdown--
            if (this.warningCountdown <= 0) {
                clearInterval(this.warningInterval)

                this.handler.handleAlert(
                    'Info',
                    'Anda telah tidak aktif terlalu lama. Ujian akan disubmit secara otomatis.'
                )
                this.submitAnswer(false)
            }
        }, 1000)
    }

    resetWarningCountdown () {
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }
        this.warningCountdown = 30
    }

    onBlur () {
        this.enterFullScreen()
    }

    enterFullScreen () {
        const elem = document.documentElement as HTMLElement & {
            mozRequestFullScreen?: () => Promise<void>
            webkitRequestFullscreen?: () => Promise<void>
            msRequestFullscreen?: () => Promise<void>
        }

        const requestFullScreen =
            elem.requestFullscreen ||
            elem.mozRequestFullScreen ||
            elem.webkitRequestFullscreen ||
            elem.msRequestFullscreen

        if (requestFullScreen) {
            requestFullScreen.call(elem).catch(err => {
                console.error('Failed to enter fullscreen:', err)
            })
        } else {
            console.warn('Fullscreen API is not supported in this browser.')
        }
    }

    ngOnDestroy () {
        this.destroy$.next()
        this.destroy$.complete()

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }
        if (this.warningInterval) {
            clearInterval(this.warningInterval)
        }
    }

    backToHome () {
        this.router.navigate(['/'])
    }

    startCountdown () {
        if (
            !this.examEndTime ||
            !this.examAttendance?.startAt ||
            !this.examAttendance?.duration
        )
            return

        const startTime = new Date(this.examAttendance.startAt).getTime()
        const durationMs = this.examAttendance.duration * 60 * 60 * 1000
        const calculatedEndTime = startTime + durationMs
        const hardEndTime = this.examEndTime.getTime()
        const effectiveEndTime = Math.min(calculatedEndTime, hardEndTime)

        const now = new Date().getTime()
        const initialTimeLeft = effectiveEndTime - now

        if (initialTimeLeft <= 0) {
            this.remainingTime = '00:00:00'
            this.remainingSeconds = 0
            this.submitAnswer(false)
            return
        }

        this.remainingTime = this.formatTime(initialTimeLeft)
        this.remainingSeconds = Math.floor(initialTimeLeft / 1000)

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }

        this.countdownInterval = setInterval(() => {
            const now = new Date().getTime()
            const timeLeft = effectiveEndTime - now

            if (timeLeft <= 0) {
                clearInterval(this.countdownInterval)
                this.remainingTime = '00:00:00'
                this.remainingSeconds = 0
                this.submitAnswer(false)
                this.handler.handleAlert(
                    'Info',
                    'Waktu ujian telah habis. Jawaban akan disimpan secara otomatis.'
                )
            } else {
                this.remainingTime = this.formatTime(timeLeft)
                this.remainingSeconds = Math.floor(timeLeft / 1000)
            }
        }, 1000)
    }

    formatTime (ms: number): string {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(
            seconds
        )}`
    }

    padZero (num: number): string {
        return num < 10 ? `0${num}` : `${num}`
    }

    getRoomUkom () {
        this.isLoadingRoomUkom$.next(true)
        this.api
            .getData(
                `/api/v1/participant_ukom/nip/${LoginContext.getUserId().replace(
                    'PU-',
                    ''
                )}`
            )
            .pipe(
                switchMap((response: any) => {
                    this.roomUkom = new RoomUkom(response.roomUkomDto)
                    this.room_id = response.roomUkomDto.id
                    this.pesertaUkom = response

                    if (response.roomUkomDto.examScheduleDtoList) {
                        const catSchedule =
                            response.roomUkomDto.examScheduleDtoList.find(
                                (e: any) => e.examTypeCode === 'CAT'
                            )

                        if (catSchedule?.endTime) {
                            const serverTimezoneOffset = '+07:00'

                            const endTimeString = `${catSchedule.endTime.replace(
                                ' ',
                                'T'
                            )}${serverTimezoneOffset}`
                            this.examEndTime = new Date(endTimeString)
                        } else {
                            console.warn(
                                'CAT exam end time not found in schedule list.'
                            )
                            this.handler.handleAlert(
                                'Error',
                                'Informasi waktu berakhir ujian CAT tidak ditemukan.'
                            )
                            this.isSubmitted$.next(true)
                        }
                    }

                    const roomId = response.roomUkomDto.id
                    const participantId = response.id
                    const examTypeCode = 'CAT'

                    return this.api.getData(
                        `/api/v1/exam_attendance/${examTypeCode}/${roomId}/${participantId}`
                    )
                }),
                finalize(() => {
                    this.isLoadingRoomUkom$.next(false)
                })
            )
            .subscribe({
                next: (attendanceResponse: ExamAttendance) => {
                    this.examAttendance = new ExamAttendance(attendanceResponse)

                    if (this.examAttendance.startAt) {
                        const serverTimezoneOffset = '+07:00'
                        const startAtString = `${this.examAttendance.startAt.replace(
                            ' ',
                            'T'
                        )}${serverTimezoneOffset}`
                        this.examAttendance.startAt = new Date(
                            startAtString
                        ).toISOString()
                    }
                    this.startCountdown()

                    this.getQuestion()
                },
                error: err => {
                    console.error('Error:', err)
                    this.handler.handleAlert(
                        'Error',
                        'Gagal mengambil data kehadiran'
                    )
                }
            })
    }

    getQuestion () {
        this.api
            .getData(`/api/v1/exam/page/CAT/${this.room_id}?limit=1000&page=1`)
            .subscribe({
                next: (response: any) => {
                    this.data.data = response.data
                    this.totalQuestions = this.data.data.length

                    this.data.data.forEach((question: any) => {
                        if (question.answerDto?.id) {
                            this.savedAnswer[question.id] =
                                question.answerDto.answerChoice
                            this.selectedAnswer[question.id] =
                                question.answerDto.answerChoice
                        }
                    })
                },
                error: err => {
                    if (err.error.message === `Exam's already ended`) {
                        this.isSubmitted$.next(true)
                    } else {
                        this.handler.handleAlert(
                            'Error',
                            'Gagal mengambil pertanyaan'
                        )
                    }
                }
            })
    }

    navigateToPage (page: number) {
        if (page > 0 && page <= this.totalQuestions) {
            this.currentPage = page
        }
    }

    selectAnswer (questionId: string, choiceId: string) {
        this.selectedAnswer[questionId] = choiceId
    }

    onSaveButtonClick (questionId: string) {
        this.saveAnswer(questionId).subscribe({
            next: () => {},
            error: err => {}
        })
    }

    saveAnswer (questionId: string): Observable<any> {
        const selectedChoiceId = this.selectedAnswer[questionId]
        if (!selectedChoiceId) {
            console.warn('No answer selected for question:', questionId)
            return throwError(() => new Error('No answer selected'))
        }

        const payload = {
            answer_choice: selectedChoiceId,
            participant_id: this.pesertaUkom.id,
            question_id: questionId
        }

        this.isSavingAnswer$.next(true)

        return this.api.postData('/api/v1/exam/answer', payload).pipe(
            tap(response => {
                this.savedAnswer[questionId] = selectedChoiceId
                if (this.currentPage < this.totalQuestions) {
                    this.navigateToPage(this.currentPage + 1)
                }
            }),
            finalize(() => this.isSavingAnswer$.next(false))
        )
    }

    submitAfterSave (questionId: string) {
        this.saveAnswer(questionId).subscribe({
            next: () => {
                this.submitAnswer(true)
            },
            error: err => {
                console.error('Error saving answer before submit:', err)
                this.handler.handleAlert(
                    'Error',
                    'Gagal menyimpan jawaban, tidak dapat submit.'
                )
            }
        })
    }

    submitAnswer (open_dialog: boolean = true) {
        const payload = {
            examTypeCode: 'CAT',
            roomUkomId: this.room_id
        }

        const performSubmission = () => {
            this.isSubmittingAnswer$.next(true)
            this.api.postData('/api/v1/exam/finish', payload).subscribe({
                next: response => {
                    this.handler.handleAlert(
                        'Success',
                        'Jawaban berhasil disimpan'
                    )
                    this.router.navigate(['/'])
                    this.isSubmitted$.next(true)
                    this.isSubmittingAnswer$.next(false)
                },
                error: err => {
                    this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
                    this.isSubmittingAnswer$.next(false)
                }
            })
        }

        if (open_dialog) {
            this.confirmationService.open(false).subscribe({
                next: ({ confirmed }) => {
                    if (confirmed) performSubmission()
                }
            })
        } else {
            performSubmission()
        }
    }
}
