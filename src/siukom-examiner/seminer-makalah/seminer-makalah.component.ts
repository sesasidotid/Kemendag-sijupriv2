// import { Component, computed, inject, OnInit, signal } from '@angular/core'
// import { CommonModule } from '@angular/common'
// import { FormsModule } from '@angular/forms'
// import { HandlerService } from '@/modules/base/services/handler.service'
// import { ConfirmationService } from '@/modules/base/services/confirmation.service'
// import { ActivatedRoute, Router } from '@angular/router'
// import { ExamService } from '@/modules/ukom/services/exam.service'
// import { finalize } from 'rxjs'
// import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
// import {
//     MakalahExamAnswer,
//     SaveExamAnswerRequest,
// } from '@/modules/ukom/models/exam/exam-answer.model'
// import { SeminarMakalahDraftService } from '@/siukom-examiner/seminer-makalah/seminer-makalah-draft.service'
//
// @Component({
//     selector: 'app-seminer-makalah',
//     standalone: true,
//     imports: [CommonModule, FormsModule],
//     templateUrl: './seminer-makalah.component.html',
//     styleUrls: ['./seminer-makalah.component.scss'],
// })
// export class SeminerMakalahComponent implements OnInit {
//     handlerService = inject(HandlerService)
//     confirmationService = inject(ConfirmationService)
//
//     examScheduleId: string
//     participantId: string
//     loadingQuestions = signal(false)
//     participantAnswer = signal<ExamQuestion | null>(null)
//     questions = signal<ExamQuestion[]>([])
//     answers = signal<Record<string, MakalahExamAnswer>>({})
//     submitQuestionLoading = signal(false)
//
//     paperUrl = computed(() => {
//         const answer = this.participantAnswer()
//         return answer?.answerDto?.answerUploadUrl ?? null
//     })
//     examStarted = computed(() => !!this.paperUrl())
//
//     private route = inject(ActivatedRoute)
//     private router = inject(Router)
//     private examService = inject(ExamService)
//     private handlerServive = inject(HandlerService)
//     private draftService = inject(SeminarMakalahDraftService)
//     private saveTimeout: number | undefined
//
//     constructor() {}
//
//     ngOnInit(): void {
//         this.examScheduleId = this.route.snapshot.paramMap.get('id')
//         this.participantId = this.route.snapshot.paramMap.get('participantId')
//         this.fetchQuestionsToGrade()
//     }
//
//     fetchQuestionsToGrade() {
//         this.loadingQuestions.set(true)
//
//         this.examService
//             .getExamQuestionsByScheduleAndParticipant(
//                 this.examScheduleId,
//                 this.participantId,
//                 { page: '1', limit: '1000' },
//             )
//             .pipe(finalize(() => this.loadingQuestions.set(false)))
//             .subscribe({
//                 next: async (result) => {
//                     const allQuestions = result.data
//
//                     const baseQuestion =
//                         allQuestions.find(
//                             (q) => q.parentQuestionId === null && q.answerDto,
//                         ) ?? null
//
//                     const examinerQuestions = baseQuestion
//                         ? allQuestions.filter(
//                               (q) => q.parentQuestionId === baseQuestion.id,
//                           )
//                         : []
//
//                     this.participantAnswer.set(baseQuestion)
//                     this.questions.set(examinerQuestions)
//
//                     const initialAnswers: Record<string, MakalahExamAnswer> = {}
//
//                     // Initialize answers
//                     examinerQuestions.forEach((q) => {
//                         initialAnswers[q.id] = new MakalahExamAnswer({
//                             questionId: q.id,
//                         })
//                     })
//
//                     // Load draft first
//                     const draft = await this.draftService.load(
//                         this.examScheduleId,
//                         this.participantId,
//                     )
//
//                     if (draft) {
//                         this.answers.set(draft.answers)
//                     } else {
//                         this.answers.set(initialAnswers)
//                     }
//
//                     // Prioritize server answers over draft
//                     const finalAnswers = { ...this.answers() }
//                     examinerQuestions.forEach((q) => {
//                         if (q.answerDto) {
//                             const hasScore =
//                                 q.answerDto.score !== null &&
//                                 q.answerDto.score !== undefined
//                             const hasAnswerText =
//                                 q.answerDto.answerText !== null &&
//                                 q.answerDto.answerText !== undefined &&
//                                 q.answerDto.answerText.trim() !== ''
//
//                             if (hasScore || hasAnswerText) {
//                                 finalAnswers[q.id] = new MakalahExamAnswer({
//                                     questionId: q.id,
//                                     answerText: q.answerDto.answerText || '',
//                                     score: q.answerDto.score,
//                                 })
//                             }
//                         }
//                     })
//                     this.answers.set(finalAnswers)
//                 },
//                 error: (err) => {
//                     console.error(err)
//                     this.handlerServive.handleAlert(
//                         'Error',
//                         'Gagal mengambil data makalah peserta.',
//                     )
//                 },
//             })
//     }
//
//     openPaper(): void {
//         if (this.paperUrl()) {
//             window.open(this.paperUrl(), '_blank')
//         } else {
//             this.handlerService.handleAlert(
//                 'Info',
//                 'Tidak ada file makalah untuk dibuka.',
//             )
//         }
//     }
//
//     isFormValid(): boolean {
//         return this.questions().every(
//             (q) =>
//                 this.answers()[q.id]?.score !== undefined &&
//                 this.answers()[q.id]?.score !== null,
//         )
//     }
//
//     submitAssessment(): void {
//         this.confirmationService.open(false).subscribe({
//             next: ({ confirmed }) => {
//                 if (!confirmed) return
//
//                 this.submitQuestionLoading.set(true)
//
//                 const payload: SaveExamAnswerRequest = {
//                     answerDtoList: Object.values(this.answers()).map(
//                         (answer) => ({
//                             ...answer,
//                             participantId: this.participantId,
//                         }),
//                     ),
//                 }
//
//                 this.examService
//                     .saveExamAnswersForExaminerByExamScheduleId(
//                         this.examScheduleId,
//                         payload,
//                     )
//                     .pipe(finalize(() => this.submitQuestionLoading.set(false)))
//                     .subscribe({
//                         next: () => {
//                             this.handlerService.handleAlert(
//                                 'Success',
//                                 'Penilaian makalah berhasil disimpan.',
//                             )
//                             this.draftService
//                                 .remove(this.examScheduleId, this.participantId)
//                                 .then(() => {
//                                     this.backToDashboard()
//                                 })
//                         },
//                         error: (err) => {
//                             console.error(err)
//                             this.handlerService.handleAlert(
//                                 'Error',
//                                 'Gagal menyimpan penilaian makalah.',
//                             )
//                         },
//                     })
//             },
//         })
//     }
//
//     backToDashboard() {
//         this.router.navigate(['/'])
//     }
//
//     scheduleAutoSave() {
//         clearTimeout(this.saveTimeout)
//         this.saveTimeout = window.setTimeout(() => {
//             this.draftService.save(
//                 this.examScheduleId,
//                 this.participantId,
//                 this.answers(),
//             )
//         }, 500)
//     }
// }

import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { finalize } from 'rxjs'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { SaveExamAnswerRequest } from '@/modules/ukom/models/exam/exam-answer.model'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { SeminarMakalahDraftService } from '@/siukom-examiner/seminer-makalah/seminer-makalah-draft.service'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { ExamAssessmentLayoutComponent } from '@/siukom-examiner/_shared/components/exam-assessment-layout/exam-assessment-layout.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-seminer-makalah',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        EmptyStateComponent,
        ExamAssessmentLayoutComponent,
        LoadingButtonComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './seminer-makalah.component.html',
    styleUrls: ['./seminer-makalah.component.scss'],
})
export class SeminerMakalahComponent implements OnInit {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    formValidationService = inject(FormValidationService)
    route = inject(ActivatedRoute)
    fb = inject(FormBuilder)
    draftService = inject(SeminarMakalahDraftService)
    router = inject(Router)
    examService = inject(ExamService)

    loadingQuestions = signal(false)
    submitting = signal(false)
    examId = signal('')
    participantId = signal('')
    questions = signal<ExamQuestion[]>([])
    participantAnswer = signal<ExamQuestion | null>(null)

    assessmentForm: FormGroup
    private saveTimeout: number | undefined

    constructor() {
        this.assessmentForm = this.fb.group({
            answerDtoList: this.fb.array([]),
        })

        // Subscribe to form value changes for auto-save
        this.assessmentForm.valueChanges.subscribe(() => {
            this.scheduleAutoSave()
        })

        effect(
            () => {
                const examId = this.examId()
                const participantId = this.participantId()
                if (examId && participantId) {
                    this.fetchQuestionsToGrade()
                }
            },
            { allowSignalWrites: true },
        )
    }

    get answerDtoList(): FormArray {
        return this.assessmentForm.get('answerDtoList') as FormArray
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.examId.set(params['id'])
            this.participantId.set(params['participantId'])
        })
    }

    fetchQuestionsToGrade() {
        this.loadingQuestions.set(true)
        this.examService
            .getExamQuestionsByScheduleAndParticipant(
                this.examId(),
                this.participantId(),
                { page: '1', limit: '1000' },
            )
            .pipe(finalize(() => this.loadingQuestions.set(false)))
            .subscribe({
                next: async (result) => {
                    const data = result.data
                    const baseQuestion = data.find(
                        (item) => item.id === 'base_makalah_question',
                    )
                    const otherQuestions = data.filter(
                        (item) => item.id !== 'base_makalah_question',
                    )
                    this.participantAnswer.set(baseQuestion || null)

                    // Load draft first
                    const draft = await this.draftService.load(
                        this.examId(),
                        this.participantId(),
                    )

                    // Initialize answers - prioritize backend data over draft
                    otherQuestions.forEach((q) => {
                        const draftAnswer = draft?.answers?.[q.id]
                        const hasBackendAnswer =
                            q.answerDto &&
                            (q.answerDto.score != null ||
                                q.answerDto.answerText != null)

                        if (!q.answerDto) {
                            // No backend answer - use draft if available
                            q.answerDto = {
                                participantId: this.participantId(),
                                questionId: q.id,
                                score: draftAnswer?.score ?? null,
                                answerText: draftAnswer?.answerText ?? null,
                            }
                        } else if (!hasBackendAnswer && draftAnswer) {
                            // Backend answer exists but empty - prefer draft
                            q.answerDto.score =
                                draftAnswer.score ?? q.answerDto.score
                            q.answerDto.answerText =
                                draftAnswer.answerText ?? q.answerDto.answerText
                        }
                        // Else: Backend has answer - keep it (prioritize backend)
                    })

                    this.questions.set(otherQuestions)
                    this.buildFormArray(otherQuestions)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data pertanyaan untuk dinilai.',
                    )
                },
            })
    }

    openAnswer(): void {
        window.open(
            this.participantAnswer()?.answerDto?.answerUploadUrl,
            '_blank',
        )
    }

    buildFormArray(questions: ExamQuestion[]): void {
        // Clear existing form array
        this.answerDtoList.clear()

        // Add form group for each question
        questions.forEach((q) => {
            const maxScore = q.weight || 100
            const formGroup = this.fb.group({
                id: [q.answerDto?.id || null],
                participantId: [
                    q.answerDto?.participantId || this.participantId(),
                ],
                questionId: [q.id],
                score: [
                    q.answerDto?.score ?? null,
                    [
                        Validators.required,
                        Validators.min(0),
                        Validators.max(maxScore),
                    ],
                ],
                answerText: [q.answerDto?.answerText || null],
            })
            this.answerDtoList.push(formGroup)
        })
    }

    validateScore(index: number): void {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const scoreControl = formGroup.get('score')
        const question = this.questions()[index]
        const maxScore = question?.weight || 100

        if (
            scoreControl &&
            scoreControl.value !== null &&
            scoreControl.value !== ''
        ) {
            let score = Number(scoreControl.value)
            if (score < 0) score = 0
            if (score > maxScore) score = maxScore
            scoreControl.setValue(score)
        }
        scoreControl?.markAsTouched()
    }

    getScoreError(index: number): string | null {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const scoreControl = formGroup.get('score')
        const question = this.questions()[index]
        const maxScore = question?.weight || 100

        if (!scoreControl || !scoreControl.errors || !scoreControl.touched) {
            return null
        }

        if (scoreControl.errors['required']) {
            return 'Nilai tidak boleh kosong.'
        }
        if (scoreControl.errors['min']) {
            return 'Nilai tidak boleh kurang dari 0.'
        }
        if (scoreControl.errors['max']) {
            return `Nilai tidak boleh melebihi bobot maksimal (${maxScore}).`
        }

        return this.formValidationService.getErrorMessage(
            scoreControl,
            'score',
            'Nilai',
        )
    }

    isScoreInvalid(index: number): boolean {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const scoreControl = formGroup.get('score')
        return !!(scoreControl && scoreControl.invalid && scoreControl.touched)
    }

    markAllAsTouched(): void {
        this.answerDtoList.controls.forEach((control) => {
            const formGroup = control as FormGroup
            Object.keys(formGroup.controls).forEach((key) => {
                formGroup.get(key)?.markAsTouched()
            })
        })
    }

    scheduleAutoSave(): void {
        clearTimeout(this.saveTimeout)
        this.saveTimeout = window.setTimeout(() => {
            const answers: Record<string, any> = {}
            const formValues = this.answerDtoList.value

            // Convert form array to record keyed by questionId
            formValues.forEach((item: any) => {
                answers[item.questionId] = {
                    id: item.id,
                    participantId: item.participantId,
                    questionId: item.questionId,
                    score: item.score,
                    answerText: item.answerText,
                }
            })

            this.draftService
                .save(this.examId(), this.participantId(), answers)
                .catch((err) => console.warn('Failed to save draft:', err))
        }, 500)
    }

    submitAssessment(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                // Mark all fields as touched to show validation errors
                this.markAllAsTouched()

                const formValues = this.answerDtoList.value

                // Build payload in SaveExamAnswerRequest format
                const payload: SaveExamAnswerRequest = {
                    answerDtoList: formValues.map((item: any) => ({
                        ...(item.id && { id: item.id }),
                        participantId: item.participantId,
                        questionId: item.questionId,
                        score: item.score,
                        answerText: item.answerText,
                    })),
                }

                this.submitting.set(true)

                this.examService
                    .saveExamAnswersForExaminerByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(finalize(() => this.submitting.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Penilaian berhasil disimpan.',
                            )
                            // Clear draft after successful save
                            this.draftService
                                .remove(this.examId(), this.participantId())
                                .catch((err) =>
                                    console.warn('Failed to clear draft:', err),
                                )
                            // Refetch questions to get updated answerDto
                            this.fetchQuestionsToGrade()
                        },
                        error: (err) => {
                            console.error('Error save the answer:', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan penilaian.',
                            )
                        },
                    })
            },
        })
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    isAllQuestionsAnswered(): boolean {
        return !this.questions().some((item) => item.answerDto?.score == null)
    }
}
