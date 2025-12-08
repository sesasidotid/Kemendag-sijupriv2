import { Injectable, signal } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { BehaviorSubject, Observable, throwError } from 'rxjs'
import { finalize, tap } from 'rxjs/operators'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'
import { CATAnswerState } from '@/modules/ukom/models/cat/cat-answer-state.model'

/**
 * Service responsible for managing exam answers, question navigation, and submission
 */
@Injectable({
    providedIn: 'root',
})
export class CatAnswerService {
    readonly currentPage = signal(1)
    readonly totalQuestions = signal(0)
    readonly selectedAnswer = signal<{ [questionId: string]: string }>({})
    readonly savedAnswer = signal<{ [questionId: string]: string }>({})
    readonly flaggedQuestions = signal<Set<string>>(new Set())

    readonly isSavingAnswer$ = new BehaviorSubject<boolean>(false)
    readonly isSubmittingAnswer$ = new BehaviorSubject<boolean>(false)

    private readonly FLAGGED_KEY = 'cat_flagged_questions'

    constructor(
        private api: ApiService,
        private handler: HandlerService,
        private confirmationService: ConfirmationService,
    ) {
        this.loadFlaggedQuestions()
    }

    /**
     * Load questions and initialize answer tracking
     */
    loadQuestions(
        examScheduleId: string,
    ): Observable<PaginationWrapper<CATQuestions>> {
        return this.api
            .getData(`/api/v1/exam/page/${examScheduleId}?limit=1000&page=1`)
            .pipe(
                tap((response) => {
                    const questions = response.data || []
                    this.totalQuestions.set(questions.length)

                    const saved: { [key: string]: string } = {}
                    const selected: { [key: string]: string } = {}

                    questions.forEach((question: any) => {
                        if (question.answerDto?.id) {
                            saved[question.id] = question.answerDto.answerChoice
                            selected[question.id] =
                                question.answerDto.answerChoice
                        }
                    })

                    this.savedAnswer.set(saved)
                    this.selectedAnswer.set(selected)
                }),
            )
    }

    /**
     * Navigate to a specific question page
     */
    navigateToPage(page: number) {
        if (page > 0 && page <= this.totalQuestions()) {
            this.currentPage.set(page)
        }
    }

    /**
     * Toggle flag for review on a question
     */
    toggleFlag(questionId: string) {
        const current = new Set(this.flaggedQuestions())
        if (current.has(questionId)) {
            current.delete(questionId)
        } else {
            current.add(questionId)
        }
        this.flaggedQuestions.set(current)
        this.saveFlaggedQuestions()
    }

    /**
     * Check if a question is flagged
     */
    isFlagged(questionId: string): boolean {
        return this.flaggedQuestions().has(questionId)
    }

    /**
     * Load flagged questions from localStorage
     */
    private loadFlaggedQuestions() {
        const stored = localStorage.getItem(this.FLAGGED_KEY)
        if (stored) {
            try {
                const flaggedArray = JSON.parse(stored)
                this.flaggedQuestions.set(new Set(flaggedArray))
            } catch (e) {
                console.error('Failed to load flagged questions:', e)
            }
        }
    }

    /**
     * Save flagged questions to localStorage
     */
    private saveFlaggedQuestions() {
        const flaggedArray = Array.from(this.flaggedQuestions())
        localStorage.setItem(this.FLAGGED_KEY, JSON.stringify(flaggedArray))
    }

    /**
     * Public method to save flagged questions to localStorage
     */
    saveFlaggedToLocalStorage() {
        this.saveFlaggedQuestions()
    }

    /**
     * Select an answer for a question
     */
    selectAnswer(questionId: string, choiceId: string) {
        const current = this.selectedAnswer()
        this.selectedAnswer.set({ ...current, [questionId]: choiceId })
    }

    /**
     * Save a single answer to the backend
     */
    saveAnswer(
        questionId: string,
        participantId: string,
        isUncertain: boolean = false,
        examScheduleId: string,
    ): Observable<void> {
        const currentSelected = this.selectedAnswer()
        const selectedChoiceId = currentSelected[questionId]

        if (!selectedChoiceId) {
            console.warn('No answer selected for question:', questionId)
            return throwError(() => new Error('Soal belum dijawab'))
        }

        const payload = {
            answer_choice: selectedChoiceId,
            participant_id: participantId,
            question_id: questionId,
            isUncertain: isUncertain,
        }

        this.isSavingAnswer$.next(true)

        return this.api
            .postData(`/api/v1/exam/answer/${examScheduleId}`, payload)
            .pipe(
                tap(() => {
                    const currentSaved = this.savedAnswer()
                    this.savedAnswer.set({
                        ...currentSaved,
                        [questionId]: selectedChoiceId,
                    })

                    // Auto-navigate to next question if not on last question
                    if (this.currentPage() < this.totalQuestions()) {
                        this.navigateToPage(this.currentPage() + 1)
                    }
                }),
                finalize(() => this.isSavingAnswer$.next(false)),
            )
    }

    /**
     * Submit the entire exam
     */
    submitExam(
        examTypeCode: string,
        roomUkomId: string,
        examScheduleId: string,
        openDialog: boolean = true,
    ): Observable<void> {
        const payload = {
            examTypeCode,
            roomUkomId,
            examScheduleId,
        }

        const performSubmission = (): Observable<void> => {
            this.isSubmittingAnswer$.next(true)
            return this.api.postData('/api/v1/exam/finish', payload).pipe(
                tap(() => {
                    this.handler.handleAlert(
                        'Success',
                        'Jawaban berhasil disimpan',
                    )
                }),
                finalize(() => this.isSubmittingAnswer$.next(false)),
            )
        }

        if (openDialog) {
            const flaggedCount = this.flaggedQuestions().size
            const answeredCount = Object.keys(this.savedAnswer()).length
            const total = this.totalQuestions()
            const unansweredCount = total - answeredCount

            const text = `Apakah Anda yakin ingin menyelesaikan ujian?

Ragu-ragu: ${flaggedCount}
Sudah Dijawab: ${answeredCount}
Belum Dijawab: ${unansweredCount}

Aksi yang sudah dilakukan tidak dapat dikembalikan lagi.
`.trim()

            return new Observable((observer) => {
                this.confirmationService
                    .open(false, undefined, text)
                    .subscribe({
                        next: ({ confirmed }) => {
                            if (confirmed) {
                                performSubmission().subscribe({
                                    next: (result) => observer.next(result),
                                    error: (err) => observer.error(err),
                                    complete: () => observer.complete(),
                                })
                            } else {
                                observer.complete()
                            }
                        },
                        error: (err) => observer.error(err),
                    })
            })
        } else {
            return performSubmission()
        }
    }

    /**k
     * Save current answer and then submit exam
     */
    saveAndSubmitExam(
        questionId: string,
        participantId: string,
        examTypeCode: string,
        roomUkomId: string,
        examScheduleId: string,
    ): Observable<void> {
        return new Observable((observer) => {
            // Check if currently flagged
            const isUncertain = this.isFlagged(questionId)
            this.saveAnswer(
                questionId,
                participantId,
                isUncertain,
                examScheduleId,
            ).subscribe({
                next: () => {
                    this.submitExam(
                        examTypeCode,
                        roomUkomId,
                        examScheduleId,
                        true,
                    ).subscribe({
                        next: (result) => observer.next(result),
                        error: (err) => observer.error(err),
                        complete: () => observer.complete(),
                    })
                },
                error: (err) => {
                    console.error('Error saving answer before submit:', err)
                    if (err.message === 'Soal belum dijawab') {
                        console.warn('User didn’t select an answer:', err)
                        this.handler.handleAlert(
                            'Warning',
                            'Silakan pilih jawaban terlebih dahulu',
                        )
                    } else {
                        console.error('Error saving answer before submit:', err)
                        this.handler.handleAlert(
                            'Error',
                            'Gagal menyimpan jawaban, tidak dapat submit.',
                        )
                    }
                    observer.error(err)
                },
            })
        })
    }

    /**
     * Reset answer service state
     */
    reset() {
        this.currentPage.set(1)
        this.totalQuestions.set(0)
        this.selectedAnswer.set({})
        this.savedAnswer.set({})
        this.flaggedQuestions.set(new Set())
        this.isSavingAnswer$.next(false)
        this.isSubmittingAnswer$.next(false)
        localStorage.removeItem(this.FLAGGED_KEY)
    }

    /**
     * Fetch the state of the exam (e.g. uncertain flags)
     */
    fetchExamState(
        examTypeCode: string,
        roomUkomId: string,
    ): Observable<CATAnswerState[]> {
        return this.api.getData(
            `/api/v1/exam/state/${examTypeCode}/${roomUkomId}`,
        )
    }
}
