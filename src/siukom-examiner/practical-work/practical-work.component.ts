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
                        (item) => item.id === 'base_praktik_question',
                    )
                    const otherQuestions = data.filter(
                        (item) => item.id !== 'base_praktik_question',
                    )

                    this.participantAnswer.set(baseQuestion)
                    const draft = await this.draftService.load(
                        this.examId(),
                        this.participantId(),
                    )

                    otherQuestions.forEach((q) => {
                        const draftAnswer = draft?.answers?.[q.id]

                        // Check if backend has meaningful data
                        const hasBackendAnswer =
                            q.answerDto && q.answerDto.answerText != null

                        if (!q.answerDto) {
                            // No backend answer object - use draft if available
                            q.answerDto = {
                                participantId: this.participantId(),
                                questionId: q.id,
                                answerText: draftAnswer?.answerText ?? null,
                            }
                        } else if (!hasBackendAnswer && draftAnswer) {
                            // Backend answer exists but is empty - use draft
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
            const formGroup = this.fb.group({
                id: [q.answerDto?.id || null],
                participantId: [
                    q.answerDto?.participantId || this.participantId(),
                ],
                questionId: [q.id],
                answerText: [
                    q.answerDto?.answerText || null,
                    [Validators.required],
                ],
            })
            this.answerDtoList.push(formGroup)
        })
    }

    getAnswerTextError(index: number): string | null {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const answerTextControl = formGroup.get('answerText')

        if (
            !answerTextControl ||
            !answerTextControl.touched ||
            !answerTextControl.errors
        ) {
            return null
        }

        if (answerTextControl.errors['required']) {
            return 'Catatan penilaian tidak boleh kosong.'
        }

        return this.formValidationService.getErrorMessage(
            answerTextControl,
            'answerText',
            'Catatan Penilaian',
        )
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

    submitAssessment(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.loadingSubmitForm.set(true)
                const formValues = this.answerDtoList.value

                const payload: SaveExamAnswerRequest = {
                    answerDtoList: formValues.map((item: any) => ({
                        ...(item.id && { id: item.id }),
                        participantId: item.participantId,
                        questionId: item.questionId,
                        answerText: item.answerText,
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
