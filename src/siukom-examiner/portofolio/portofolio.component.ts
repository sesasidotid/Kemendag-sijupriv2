import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
} from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { finalize } from 'rxjs'
import { PortfolioDraftService } from '@/siukom-examiner/portofolio/portfolio-draft.service'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { SaveExamAnswerRequest } from '@/modules/ukom/models/exam/exam-answer.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ExamAssessmentLayoutComponent } from '@/siukom-examiner/_shared/components/exam-assessment-layout/exam-assessment-layout.component'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExaminerExamStartRequest } from '@/modules/ukom/models/exam/start-exam-request.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

import { CatService } from '@/modules/ukom/services/cat.service'

@Component({
    selector: 'app-portofolio',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        EmptyStateComponent,
        LoadingButtonComponent,
        ExamAssessmentLayoutComponent,
    ],
    templateUrl: './portofolio.component.html',
    styleUrls: ['./portofolio.component.scss'],
})
export class PortofolioComponent implements OnInit {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    examService = inject(ExamService)
    catService = inject(CatService)
    route = inject(ActivatedRoute)
    router = inject(Router)
    loadingQuestions = signal(false)
    attendanceLoading = signal(false)
    questions = signal<ExamQuestion[]>([])
    formValidationService = inject(FormValidationService)
    fb = inject(FormBuilder)
    loadingSubmitForm = signal(false)
    assessmentForm: FormGroup

    examId = signal('')
    participantId = signal('')
    draftService = inject(PortfolioDraftService)
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
                    this.getAttendace()
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

    getAttendace() {
        this.attendanceLoading.set(true)
        this.catService
            .getExamAttendance(this.examId(), this.participantId())
            .pipe(finalize(() => this.attendanceLoading.set(false)))
            .subscribe({
                next: (res) => {
                    if (res && res.startAt) {
                        this.examStarted.set(true)
                        this.fetchQuestionsToGrade()
                    }
                },
                error: (err) => {
                    this.handlerService.handleException(err)
                    console.error('Failed to get exam attendance:', err)
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
                            examTypeCode: ExamTypeCategory.PORTOFOLIO,
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
                            this.getAttendace()
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
                    const draft = await this.draftService.load(
                        this.examId(),
                        this.participantId(),
                    )

                    data.forEach((q) => {
                        const draftAnswer = draft?.answers?.[q.id]

                        // Check if backend has meaningful data
                        const hasBackendAnswer =
                            q.answerDto &&
                            ((q.answerDto.answerText !== null &&
                                q.answerDto.answerText !== undefined) ||
                                q.answerDto.answerList?.valid === true ||
                                q.answerDto.answerList?.memadai === true)

                        if (!q.answerDto) {
                            // No backend answer object - use draft if available
                            q.answerDto = {
                                participantId: this.participantId(),
                                questionId: q.id,
                                answerText: draftAnswer?.answerText ?? null,
                                answerList: draftAnswer?.answerList ?? {
                                    valid: null,
                                    memadai: null,
                                },
                            }
                        } else if (!hasBackendAnswer && draftAnswer) {
                            // Backend answer exists but is empty - use draft
                            q.answerDto.answerText =
                                draftAnswer.answerText ?? null
                            q.answerDto.answerList = draftAnswer.answerList ?? {
                                valid: null,
                                memadai: null,
                            }
                        } else if (!q.answerDto.answerList) {
                            // Backend has data but no answerList - ensure structure exists
                            q.answerDto.answerList = {
                                valid: null,
                                memadai: null,
                            }
                        }
                        // If hasBackendAnswer is true, keep backend data (prioritize backend)
                    })

                    this.questions.set(data)
                    this.buildFormArray(data)
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
            // Get answerList from answerDto (from draft or backend)
            const answerList = q.answerDto?.answerList || {
                memadai: null,
                valid: null,
            }

            const formGroup = this.fb.group({
                id: [q.answerDto?.id || null],
                participantId: [
                    q.answerDto?.participantId || this.participantId(),
                ],
                questionId: [q.id],
                answerText: [q.answerDto?.answerText || null],
                answerList: this.fb.group({
                    memadai: [
                        answerList.memadai ?? null,
                        [this.booleanRequiredValidator.bind(this)],
                    ],
                    valid: [
                        answerList.valid ?? null,
                        [this.booleanRequiredValidator.bind(this)],
                    ],
                }),
            })
            this.answerDtoList.push(formGroup)
        })
    }

    openDocument(url: string): void {
        window.open(url, '_blank')
    }

    isItemCompetent(index: number): boolean {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const answerListGroup = formGroup.get('answerList') as FormGroup
        const valid = answerListGroup.get('valid')?.value
        const memadai = answerListGroup.get('memadai')?.value
        return valid && memadai
    }

    isCheckboxAnswered(index: number, controlName: string): boolean {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const answerListGroup = formGroup.get('answerList') as FormGroup
        const value = answerListGroup.get(controlName)?.value
        return value !== null && value !== undefined
    }

    getCheckboxState(
        index: number,
        controlName: string,
    ): 'checked' | 'unchecked' | 'unanswered' {
        const formGroup = this.answerDtoList.at(index) as FormGroup
        const answerListGroup = formGroup.get('answerList') as FormGroup
        const value = answerListGroup.get(controlName)?.value

        if (value === null || value === undefined) {
            return 'unanswered'
        }
        return value === true ? 'checked' : 'unchecked'
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
                    answerList: item.answerList,
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

    allQuestionsAnswered(): boolean {
        return this.questions().every((q) => {
            const answer = q.answerDto?.answerList
            return (
                answer != null &&
                typeof answer.valid === 'boolean' &&
                typeof answer.memadai === 'boolean'
            )
        })
    }

    allQuestionsAnsweredAndSaved(): boolean {
        return this.questions().every((q) => {
            // Check if answer exists in backend (has id from backend response)
            // and has boolean values (not null) for valid and memadai
            return (
                q.answerDto &&
                q.answerDto.id && // Backend-saved answers have an id
                typeof q.answerDto.answerList?.valid === 'boolean' &&
                typeof q.answerDto.answerList?.memadai === 'boolean'
            )
        })
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
                        answerList: item.answerList,
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
                                'Penilaian Portofolio berhasil disimpan.',
                            )
                            this.draftService
                                .remove(this.examId(), this.participantId())
                                .catch((err) =>
                                    console.warn('Failed to clear draft:', err),
                                )
                            // this.fetchQuestionsToGrade()
                            this.backToDashboard()
                        },
                        error: (err) => {
                            console.error('Error submitting assessment', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan penilaian Portofolio.',
                            )
                        },
                    })
            },
        })
    }

    /**
     * Custom validator to ensure checkbox value is boolean (not null)
     */
    private booleanRequiredValidator(
        control: AbstractControl,
    ): ValidationErrors | null {
        const value = control.value
        if (value === null || value === undefined) {
            return { required: true }
        }
        if (typeof value !== 'boolean') {
            return { required: true }
        }
        return null
    }
}
