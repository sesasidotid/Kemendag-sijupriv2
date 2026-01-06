import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { finalize } from 'rxjs'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import {
    MakalahExamAnswer,
    SaveExamAnswerRequest,
} from '@/modules/ukom/models/exam/exam-answer.model'
import { SeminarMakalahDraftService } from '@/siukom-examiner/seminer-makalah/seminer-makalah-draft.service'

@Component({
    selector: 'app-seminer-makalah',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './seminer-makalah.component.html',
    styleUrls: ['./seminer-makalah.component.scss'],
})
export class SeminerMakalahComponent implements OnInit {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)

    examScheduleId: string
    participantId: string
    loadingQuestions = signal(false)
    participantAnswer = signal<ExamQuestion | null>(null)
    questions = signal<ExamQuestion[]>([])
    answers = signal<Record<string, MakalahExamAnswer>>({})
    submitQuestionLoading = signal(false)

    paperUrl = computed(() => {
        const answer = this.participantAnswer()
        return answer?.answerDto?.answerUploadUrl ?? null
    })
    examStarted = computed(() => !!this.paperUrl())

    private route = inject(ActivatedRoute)
    private router = inject(Router)
    private examService = inject(ExamService)
    private handlerServive = inject(HandlerService)
    private draftService = inject(SeminarMakalahDraftService)
    private saveTimeout: number | undefined

    constructor() {}

    ngOnInit(): void {
        this.examScheduleId = this.route.snapshot.paramMap.get('id')
        this.participantId = this.route.snapshot.paramMap.get('participantId')
        this.fetchQuestionsToGrade()
    }

    fetchQuestionsToGrade() {
        this.loadingQuestions.set(true)

        this.examService
            .getExamQuestionsByScheduleAndParticipant(
                this.examScheduleId,
                this.participantId,
                { page: '1', limit: '1000' },
            )
            .pipe(finalize(() => this.loadingQuestions.set(false)))
            .subscribe({
                next: async (result) => {
                    const allQuestions = result.data

                    const baseQuestion =
                        allQuestions.find(
                            (q) => q.parentQuestionId === null && q.answerDto,
                        ) ?? null

                    const examinerQuestions = baseQuestion
                        ? allQuestions.filter(
                              (q) => q.parentQuestionId === baseQuestion.id,
                          )
                        : []

                    this.participantAnswer.set(baseQuestion)
                    this.questions.set(examinerQuestions)

                    const initialAnswers: Record<string, MakalahExamAnswer> = {}

                    // Initialize answers
                    examinerQuestions.forEach((q) => {
                        initialAnswers[q.id] = new MakalahExamAnswer({
                            questionId: q.id,
                        })
                    })

                    // Load draft first
                    const draft = await this.draftService.load(
                        this.examScheduleId,
                        this.participantId,
                    )

                    if (draft) {
                        this.answers.set(draft.answers)
                    } else {
                        this.answers.set(initialAnswers)
                    }

                    // Prioritize server answers over draft
                    const finalAnswers = { ...this.answers() }
                    examinerQuestions.forEach((q) => {
                        if (q.answerDto) {
                            const hasScore =
                                q.answerDto.score !== null &&
                                q.answerDto.score !== undefined
                            const hasAnswerText =
                                q.answerDto.answerText !== null &&
                                q.answerDto.answerText !== undefined &&
                                q.answerDto.answerText.trim() !== ''

                            if (hasScore || hasAnswerText) {
                                finalAnswers[q.id] = new MakalahExamAnswer({
                                    questionId: q.id,
                                    answerText: q.answerDto.answerText || '',
                                    score: q.answerDto.score,
                                })
                            }
                        }
                    })
                    this.answers.set(finalAnswers)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerServive.handleAlert(
                        'Error',
                        'Gagal mengambil data makalah peserta.',
                    )
                },
            })
    }

    openPaper(): void {
        if (this.paperUrl()) {
            window.open(this.paperUrl(), '_blank')
        } else {
            this.handlerService.handleAlert(
                'Info',
                'Tidak ada file makalah untuk dibuka.',
            )
        }
    }

    isFormValid(): boolean {
        return this.questions().every(
            (q) =>
                this.answers()[q.id]?.score !== undefined &&
                this.answers()[q.id]?.score !== null,
        )
    }

    submitAssessment(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitQuestionLoading.set(true)

                const payload: SaveExamAnswerRequest = {
                    answerDtoList: Object.values(this.answers()).map(
                        (answer) => ({
                            ...answer,
                            participantId: this.participantId,
                        }),
                    ),
                }

                this.examService
                    .saveExamAnswersByExamScheduleId(
                        this.examScheduleId,
                        payload,
                    )
                    .pipe(finalize(() => this.submitQuestionLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Penilaian makalah berhasil disimpan.',
                            )
                            this.draftService
                                .remove(this.examScheduleId, this.participantId)
                                .then(() => {
                                    this.backToDashboard()
                                })
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan penilaian makalah.',
                            )
                        },
                    })
            },
        })
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    scheduleAutoSave() {
        clearTimeout(this.saveTimeout)
        this.saveTimeout = window.setTimeout(() => {
            this.draftService.save(
                this.examScheduleId,
                this.participantId,
                this.answers(),
            )
        }, 500)
    }
}
