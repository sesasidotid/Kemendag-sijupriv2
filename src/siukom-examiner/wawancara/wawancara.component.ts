import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { CommonModule } from '@angular/common'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import {
    SaveExamAnswerRequest,
    WawancaraExamAnswer,
} from '@/modules/ukom/models/exam/exam-answer.model'
import { WawancaraDraftService } from '@/siukom-examiner/wawancara/wawancara-draft.service'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExaminerExamStartRequest } from '@/modules/ukom/models/exam/start-exam-request.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { ExamAssessmentLayoutComponent } from '@/siukom-examiner/_shared/components/exam-assessment-layout/exam-assessment-layout.component'

@Component({
    selector: 'app-wawancara',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        EmptyStateComponent,
        ExamAssessmentLayoutComponent,
    ],
    templateUrl: './wawancara.component.html',
    styleUrl: './wawancara.component.scss',
})
export class WawancaraComponent implements OnInit {
    examId = signal('')
    participantId = signal('')

    loadingQuestions = signal(false)
    questions = signal<ExamQuestion[]>([])
    submitQuestionLoading = signal(false)
    startExamLoading = signal(false)
    examStarted = signal(false)

    assessmentForm: FormGroup
    // Keep examScheduleDetail for getting roomUkomId needed for startExamByExaminer
    examScheduleDetail = signal<ExamSchedule | null>(null)
    private router = inject(Router)
    private route = inject(ActivatedRoute)
    private handlerService = inject(HandlerService)
    private confirmationService = inject(ConfirmationService)
    private examService = inject(ExamService)
    private draftService = inject(WawancaraDraftService)
    private examScheduleService = inject(UkomExamScheduleService)
    private fb = inject(FormBuilder)
    private formValidationService = inject(FormValidationService)
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

                if (examId) {
                    this.getExamScheduleDetail()
                }

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

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.examId.set(params['id'])
            this.participantId.set(params['participantId'])
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

    startTheExam() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.startExamLoading.set(true)

                this.examService
                    .startExamByExaminer(
                        new ExaminerExamStartRequest({
                            participantId: this.participantId(),
                            examTypeCode: ExamTypeCategory.WAWANCARA,
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
                            // Reload questions after starting exam
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

    backToDashboard() {
        this.router.navigate(['/'])
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
                    this.questions.set(result.data)

                    // If we have questions on initial load, exam has already started or finished
                    if (!afterStart && result.data.length > 0) {
                        this.examStarted.set(true)
                    }

                    // Load draft first
                    const draft = await this.draftService.load(
                        this.examId(),
                        this.participantId(),
                    )

                    // Initialize answers - prioritize backend data over draft
                    const questionsWithAnswers = result.data.map((q) => {
                        const draftAnswer = draft?.answers?.[q.id]
                        const hasBackendAnswer =
                            q.answerDto &&
                            (q.answerDto.answerChoice !== null ||
                                q.answerDto.answerText !== null)

                        if (!q.answerDto) {
                            // No backend answer - use draft if available
                            q.answerDto = {
                                participantId: this.participantId(),
                                questionId: q.id,
                                answerChoice: draftAnswer?.answerChoice ?? null,
                                answerText: draftAnswer?.answerText ?? null,
                            }
                        } else if (!hasBackendAnswer && draftAnswer) {
                            // Backend answer exists but empty - prefer draft
                            q.answerDto.answerChoice =
                                draftAnswer.answerChoice ??
                                q.answerDto.answerChoice
                            q.answerDto.answerText =
                                draftAnswer.answerText ?? q.answerDto.answerText
                        }
                        // Else: Backend has answer - keep it (prioritize backend)
                        return q
                    })

                    this.questions.set(questionsWithAnswers)
                    this.buildFormArray(questionsWithAnswers)
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
        // Clear existing form array
        this.answerDtoList.clear()

        // Add form group for each question
        questions.forEach((q) => {
            const formGroup = this.fb.group({
                id: [q.answerDto?.id || null],
                participantId: [
                    q.answerDto?.participantId || this.participantId(),
                ],
                questionId: [q.id],
                answerChoice: [
                    q.answerDto?.answerChoice || null,
                    [Validators.required],
                ],
                answerText: [q.answerDto?.answerText || null],
            })
            this.answerDtoList.push(formGroup)
        })
    }

    getAnswerChoiceError(index: number): string | null {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const control = formGroup.get('answerChoice')

        if (!control || !control.errors || !control.touched) {
            return null
        }

        if (control.errors['required']) {
            return 'Penilaian harus dipilih.'
        }

        return this.formValidationService.getErrorMessage(
            control,
            'answerChoice',
            'Penilaian',
        )
    }

    isAnswerChoiceInvalid(index: number): boolean {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const control = formGroup.get('answerChoice')
        return !!(control && control.invalid && control.touched)
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

                // Mark all fields as touched to show validation errors
                this.markAllAsTouched()

                const formValues = this.answerDtoList.value

                // Build payload in SaveExamAnswerRequest format
                const payload: SaveExamAnswerRequest = {
                    answerDtoList: formValues.map((item: any) => ({
                        ...(item.id && { id: item.id }),
                        participantId: item.participantId,
                        questionId: item.questionId,
                        answerChoice: item.answerChoice,
                        answerText: item.answerText,
                    })),
                }

                this.submitQuestionLoading.set(true)

                this.examService
                    .saveExamAnswersForExaminerByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(finalize(() => this.submitQuestionLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Penilaian wawancara berhasil disimpan.',
                            )
                            // Clear draft after successful save
                            this.draftService
                                .remove(this.examId(), this.participantId())
                                .catch((err) =>
                                    console.warn('Failed to clear draft:', err),
                                )
                            this.fetchQuestionsToGrade()
                        },
                        error: (err) => {
                            console.error('Error save the answer:', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan penilaian wawancara.',
                            )
                        },
                    })
            },
        })
    }

    scheduleAutoSave(): void {
        clearTimeout(this.saveTimeout)
        this.saveTimeout = window.setTimeout(() => {
            const answers: Record<string, WawancaraExamAnswer> = {}
            const formValues = this.answerDtoList.value

            // Convert form array to record keyed by questionId
            formValues.forEach((item: any) => {
                answers[item.questionId] = new WawancaraExamAnswer({
                    questionId: item.questionId,
                    answerChoice: item.answerChoice,
                    answerText: item.answerText,
                })
            })

            this.draftService
                .save(this.examId(), this.participantId(), answers)
                .catch((err) => console.warn('Failed to save draft:', err))
        }, 500)
    }

    isAllQuestionsAnswered(): boolean {
        return !this.questions().some((q) => q.answerDto.answerChoice == null)
    }
}
