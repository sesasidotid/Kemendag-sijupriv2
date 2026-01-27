import { inject, Injectable, signal } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { BehaviorSubject, map, Observable, throwError } from 'rxjs'
import { finalize, tap } from 'rxjs/operators'
import { PaginationWrapper } from '@/modules/base/models/pagination.model'
import { CATAnswerState } from '@/modules/ukom/models/cat/cat-answer-state.model'
import { CatFlaggedQuestionsService } from './cat-flagged-questions.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'

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
    private flaggedQuestionsService = inject(CatFlaggedQuestionsService)
    /** Current exam schedule ID for flagged questions storage */
    private currentExamScheduleId: string | null = null

    constructor(
        private api: ApiService,
        private handler: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    /**
     * Set the current exam schedule ID and load flagged questions from IndexedDB
     */
    async initializeForExam(examScheduleId: string): Promise<void> {
        this.currentExamScheduleId = examScheduleId
        await this.loadFlaggedQuestions()
    }

    /**
     * Load questions and initialize answer tracking
     */
    // loadQuestions(
    //     examScheduleId: string,
    // ): Observable<PaginationWrapper<ExamQuestion>> {
    //     return this.api
    //         .getData(`/api/v1/exam/page/${examScheduleId}?limit=1000&page=1`)
    //         .pipe(
    //             tap((response: PaginationWrapper<ExamQuestion>) => {
    //                 const sortedQuestions = [...response.data].sort((a, b) =>
    //                     String(a.id).localeCompare(String(b.id), undefined, {
    //                         numeric: true,
    //                     }),
    //                 )
    //
    //                 const questions = sortedQuestions || []
    //                 this.totalQuestions.set(sortedQuestions.length)
    //
    //                 const saved: { [key: string]: string } = {}
    //                 const selected: { [key: string]: string } = {}
    //
    //                 questions.forEach((question: any) => {
    //                     if (question.answerDto?.id) {
    //                         saved[question.id] = question.answerDto.answerChoice
    //                         selected[question.id] =
    //                             question.answerDto.answerChoice
    //                     }
    //                 })
    //
    //                 this.savedAnswer.set(saved)
    //                 this.selectedAnswer.set(selected)
    //             }),
    //         )
    // }
    loadQuestions(
        examScheduleId: string,
    ): Observable<PaginationWrapper<ExamQuestion>> {
        return this.api
            .getData(`/api/v1/exam/page/${examScheduleId}?limit=1000&page=1`)
            .pipe(
                map((response: PaginationWrapper<ExamQuestion>) => {
                    response.data = [...response.data].sort((a, b) =>
                        String(a.id).localeCompare(String(b.id), undefined, {
                            numeric: true,
                        }),
                    )

                    return response
                }),

                tap((response) => {
                    this.totalQuestions.set(response.data.length)

                    const saved: Record<string, string> = {}
                    const selected: Record<string, string> = {}

                    response.data.forEach((question) => {
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
     * Public method to save flagged questions to IndexedDB
     */
    saveFlaggedToStorage(): void {
        this.saveFlaggedQuestions()
    }

    /**
     * Remove flagged questions for the current exam (call on exam finish)
     */
    async clearFlaggedQuestions(): Promise<void> {
        if (!this.currentExamScheduleId) {
            return
        }

        await this.flaggedQuestionsService.remove(this.currentExamScheduleId)
        this.flaggedQuestions.set(new Set())
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
        this.currentExamScheduleId = null
    }

    /**
     * Reset answer service state and clear flagged questions from IndexedDB
     * Call this when the exam is finished
     */
    async resetWithCleanup(): Promise<void> {
        await this.clearFlaggedQuestions()
        this.reset()
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

    /**
     * Load flagged questions from IndexedDB for the current exam
     */
    private async loadFlaggedQuestions(): Promise<void> {
        if (!this.currentExamScheduleId) {
            console.warn(
                '[CatAnswerService] No exam schedule ID set, cannot load flagged questions',
            )
            return
        }

        const flagged = await this.flaggedQuestionsService.load(
            this.currentExamScheduleId,
        )
        this.flaggedQuestions.set(flagged)
    }

    /**
     * Save flagged questions to IndexedDB for the current exam
     */
    private saveFlaggedQuestions(): void {
        if (!this.currentExamScheduleId) {
            console.warn(
                '[CatAnswerService] No exam schedule ID set, cannot save flagged questions',
            )
            return
        }

        // Fire-and-forget save to IndexedDB
        this.flaggedQuestionsService
            .save(this.currentExamScheduleId, this.flaggedQuestions())
            .catch((err) =>
                console.error(
                    '[CatAnswerService] Failed to save flagged questions:',
                    err,
                ),
            )
    }
}
