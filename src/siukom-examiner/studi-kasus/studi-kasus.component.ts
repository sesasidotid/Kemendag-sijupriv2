import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { SaveExamAnswerRequest } from '@/modules/ukom/models/exam/exam-answer.model'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { StudiKasusDraftService } from './studi-kasus-draft.service'
import { ExamAssessmentLayoutComponent } from '@/siukom-examiner/_shared/components/exam-assessment-layout/exam-assessment-layout.component'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExaminerExamStartRequest } from '@/modules/ukom/models/exam/start-exam-request.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

@Component({
    selector: 'app-studi-kasus',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EmptyStateComponent,
        LoadingButtonComponent,
        ExamAssessmentLayoutComponent,
    ],
    templateUrl: './studi-kasus.component.html',
    styleUrls: ['./studi-kasus.component.scss'],
})
export class StudiKasusComponent implements OnInit {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    formValidationService = inject(FormValidationService)
    route = inject(ActivatedRoute)
    fb = inject(FormBuilder)
    draftService = inject(StudiKasusDraftService)
    router = inject(Router)
    examService = inject(ExamService)
    loadingQuestions = signal(false)
    submitting = signal(false)
    examId = signal('')
    participantId = signal('')
    questions = signal<ExamQuestion[]>([])
    assessmentForm: FormGroup
    participantAnswer = signal<ExamQuestion | null>(null)
    startExamLoading = signal(false)
    examStarted = signal(false)
    examScheduleService = inject(UkomExamScheduleService)
    examScheduleDetail = signal<ExamSchedule | null>(null)
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

        effect(
            () => {
                const examId = this.examId()
                if (examId) {
                    this.getExamScheduleDetail()
                }
            },
            { allowSignalWrites: true },
        )
    }

    get answerDtoList(): FormArray {
        return this.assessmentForm.get('answerDtoList') as FormArray
    }

    get finalScore(): number {
        const items = this.questions()
        const formValues = this.answerDtoList.value
        if (formValues.length === 0) return 0

        const scoredItems = formValues.filter(
            (item: any, index: number) =>
                item.score !== null &&
                item.score !== undefined &&
                item.score !== '',
        )
        if (scoredItems.length === 0) return 0

        let totalMaxScore = 0
        let totalScore = 0

        scoredItems.forEach((formItem: any) => {
            const question = items.find((q) => q.id === formItem.questionId)
            const maxScore = question?.weight || 100
            totalMaxScore += maxScore
            totalScore += Number(formItem.score) || 0
        })

        return Math.round((totalScore / totalMaxScore) * 100)
    }

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.examId.set(params['id'])
            this.participantId.set(params['participantId'])
        })
    }

    startTheExam() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.startExamLoading.set(true)

                this.examService
                    .startExamByExaminer(
                        new ExaminerExamStartRequest({
                            participantId: this.participantId(),
                            examTypeCode: ExamTypeCategory.STUDI_KASUS,
                            roomUkomId: this.examScheduleDetail().roomUkomId,
                            examScheduleId: this.examId(),
                        }),
                    )
                    .pipe(finalize(() => this.startExamLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil memulai ujian.',
                            )
                            this.examStarted.set(true)
                            this.fetchQuestionsToGrade(true)
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal memulai ujian, silahkan coba lagi.',
                            )
                        },
                    })
            },
        })
    }

    getExamScheduleDetail() {
        this.examScheduleService
            .getExamScheduleDetailById(this.examId())
            .subscribe({
                next: (res) => {
                    this.examScheduleDetail.set(res)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data jadwal.',
                    )
                },
            })
    }

    fetchQuestionsToGrade(afterStart: boolean = false) {
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
                    // const baseQuestion = data.find(
                    //     (item) => item.id === 'base_studi_kasus_question',
                    // )
                    // const otherQuestions = data.filter(
                    //     (item) => item.id !== 'base_studi_kasus_question',
                    // )
                    const isBaseQuestion = (q: ExamQuestion) =>
                        q.id?.startsWith('studi_kasus_')

                    const baseQuestion = data.find(isBaseQuestion)
                    const otherQuestions = data.filter((q) => !isBaseQuestion(q))
                    this.participantAnswer.set(baseQuestion || null)

                    // If we have questions on initial load, exam has already started
                    if (!afterStart && otherQuestions.length > 0) {
                        this.examStarted.set(true)
                    }

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
                            // this.fetchQuestionsToGrade()

                            this.backToDashboard()
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

    isAllQuestionsAnsweredAndSaved(): boolean {
        return this.questions().every((item) => {
            // Check if answer is saved to backend (has id) and has meaningful data
            return (
                item.answerDto &&
                item.answerDto.id && // Backend-saved answers have an id
                item.answerDto.score != null
            )
        })
    }
}
