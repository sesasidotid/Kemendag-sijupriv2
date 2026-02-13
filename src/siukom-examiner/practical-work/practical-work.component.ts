import { Component, effect, inject, signal } from '@angular/core'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { PracticalWorkDraftService } from '@/siukom-examiner/practical-work/practical-work-draft.service'
import { finalize } from 'rxjs'
import { SaveExamAnswerRequest } from '@/modules/ukom/models/exam/exam-answer.model'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { CommonModule } from '@angular/common'
import { VideoPreviewComponent } from '@/modules/base/components/video-preview/video-preview.component'
import { ExamAssessmentLayoutComponent } from '@/siukom-examiner/_shared/components/exam-assessment-layout/exam-assessment-layout.component'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExaminerExamStartRequest } from '@/modules/ukom/models/exam/start-exam-request.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

@Component({
    selector: 'app-practical-work',
    standalone: true,
    imports: [
        CommonModule,
        EmptyStateComponent,
        FormsModule,
        LoadingButtonComponent,
        ReactiveFormsModule,
        VideoPreviewComponent,
        ExamAssessmentLayoutComponent,
    ],
    templateUrl: './practical-work.component.html',
    styleUrl: './practical-work.component.scss',
})
export class PracticalWorkComponent {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    examService = inject(ExamService)
    route = inject(ActivatedRoute)
    router = inject(Router)
    loadingQuestions = signal(false)
    questions = signal<ExamQuestion[]>([])
    formValidationService = inject(FormValidationService)
    fb = inject(FormBuilder)
    loadingSubmitForm = signal(false)
    assessmentForm: FormGroup

    examId = signal('')
    participantId = signal('')
    draftService = inject(PracticalWorkDraftService)
    participantAnswer = signal<ExamQuestion>(null)
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
                            examTypeCode: ExamTypeCategory.PRAKTIK,
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

    openAnswer(): void {
        window.open(
            this.participantAnswer()?.answerDto?.answerUploadUrl,
            '_blank',
        )
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
                    const baseQuestion = data.find(
                        (item) => item.id === 'base_praktik_question',
                    )
                    const otherQuestions = data.filter(
                        (item) => item.id !== 'base_praktik_question',
                    )

                    this.participantAnswer.set(baseQuestion)

                    // If we have questions on initial load, exam has already started
                    if (!afterStart && otherQuestions.length > 0) {
                        this.examStarted.set(true)
                    }

                    const draft = await this.draftService.load(
                        this.examId(),
                        this.participantId(),
                    )

                    otherQuestions.forEach((q) => {
                        const draftAnswer = draft?.answers?.[q.id]

                        // Check if backend has meaningful data
                        const hasBackendAnswer =
                            q.answerDto &&
                            (q.answerDto.score != null ||
                                q.answerDto.answerText != null)

                        if (!q.answerDto) {
                            // No backend answer object - use draft if available
                            q.answerDto = {
                                participantId: this.participantId(),
                                questionId: q.id,
                                answerText: draftAnswer?.answerText ?? null,
                                score: draftAnswer?.score ?? null,
                            }
                        } else if (!hasBackendAnswer && draftAnswer) {
                            // Backend answer exists but is empty - use draft
                            q.answerDto.score = draftAnswer.score ?? null
                            q.answerDto.answerText =
                                draftAnswer.answerText ?? null
                        }
                        // If hasBackendAnswer is true, keep backend data (prioritize backend)
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

    buildFormArray(questions: ExamQuestion[]): void {
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
                    answerText: item.answerText,
                }
            })

            this.draftService
                .save(this.examId(), this.participantId(), answers)
                .catch((err) => console.warn('Failed to save draft:', err))
        }, 500)
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    allQuestionsAnswered() {
        return this.questions().every(
            (item) => item.answerDto?.answerText != null,
        )
    }

    allQuestionsAnsweredAndSaved(): boolean {
        return this.questions().every((item) => {
            // Check if answer is saved to backend (has id) and has meaningful data
            return (
                item.answerDto &&
                item.answerDto.id && // Backend-saved answers have an id
                item.answerDto.score != null
            )
        })
    }

    markAllAsTouched(): void {
        this.answerDtoList.controls.forEach((control) => {
            const formGroup = control as FormGroup
            Object.keys(formGroup.controls).forEach((key) => {
                formGroup.get(key)?.markAsTouched()
            })
        })
    }
    submitAssessment(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.markAllAsTouched()
                this.loadingSubmitForm.set(true)
                const formValues = this.answerDtoList.value

                const payload: SaveExamAnswerRequest = {
                    answerDtoList: formValues.map((item: any) => ({
                        ...(item.id && { id: item.id }),
                        participantId: item.participantId,
                        questionId: item.questionId,
                        answerText: item.answerText,
                        score: item.score,
                    })),
                }

                this.examService
                    .saveExamAnswersForExaminerByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(finalize(() => this.loadingSubmitForm.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Penilaian Praktik berhasil disimpan.',
                            )
                            this.draftService
                                .remove(this.examId(), this.participantId())
                                .catch((err) =>
                                    console.warn('Failed to clear draft:', err),
                                )
                            this.fetchQuestionsToGrade()
                        },
                        error: (err) => {
                            console.error('Error submitting assessment', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan penilaian Praktik.',
                            )
                        },
                    })
            },
        })
    }
}
