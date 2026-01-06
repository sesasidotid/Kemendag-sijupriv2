import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
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

@Component({
    selector: 'app-wawancara',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './wawancara.component.html',
    styleUrl: './wawancara.component.scss',
})
export class WawancaraComponent implements OnInit {
    examId: string
    participantId: string

    loadingQuestions = signal(false)
    questions = signal<ExamQuestion[]>([])
    answers = signal<Record<string, WawancaraExamAnswer>>({})
    submitQuestionLoading = signal(false)
    examScheduleDetail = signal<ExamSchedule | null>(null)
    startExamLoading = signal(false)
    examStarted = signal(false)
    private router = inject(Router)
    private route = inject(ActivatedRoute)
    private handlerService = inject(HandlerService)
    private confirmationService = inject(ConfirmationService)
    private examService = inject(ExamService)
    private draftService = inject(WawancaraDraftService)
    private examScheduleService = inject(UkomExamScheduleService)
    private saveTimeout: number | undefined

    ngOnInit() {
        this.examId = this.route.snapshot.paramMap.get('id')
        this.participantId = this.route.snapshot.paramMap.get('participantId')
        this.getExamScheduleDetail()
        this.fetchQuestionsToGrade()
    }

    getExamScheduleDetail() {
        this.examScheduleService
            .getExamScheduleDetailById(this.examId)
            .subscribe({
                next: (res) => {
                    this.examScheduleDetail.set(res)
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
                            participantId: this.participantId,
                            examTypeCode: ExamTypeCategory.WAWANCARA,
                            roomUkomId: this.examScheduleDetail().roomUkomId,
                            examScheduleId: this.examId,
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
                this.examId,
                this.participantId,
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

                    const initialAnswers: Record<string, WawancaraExamAnswer> =
                        {}

                    // Initialize answers
                    this.questions().forEach((q) => {
                        initialAnswers[q.id] = new WawancaraExamAnswer({
                            questionId: q.id,
                        })
                    })

                    // Load draft first
                    const draft = await this.draftService.load(
                        this.examId,
                        this.participantId,
                    )

                    if (draft) {
                        this.answers.set(draft.answers)
                    } else {
                        this.answers.set(initialAnswers)
                    }

                    // Prioritize server answers over draft
                    const finalAnswers = { ...this.answers() }
                    this.questions().forEach((q) => {
                        if (q.answerDto) {
                            const hasAnswerText =
                                q.answerDto.answerText !== null &&
                                q.answerDto.answerText !== undefined &&
                                q.answerDto.answerText.trim() !== ''
                            const hasAnswerChoice =
                                q.answerDto.answerChoice !== null &&
                                q.answerDto.answerChoice !== undefined &&
                                q.answerDto.answerChoice.trim() !== ''

                            if (hasAnswerText || hasAnswerChoice) {
                                finalAnswers[q.id] = new WawancaraExamAnswer({
                                    questionId: q.id,
                                    answerText: q.answerDto.answerText || '',
                                    answerChoice:
                                        q.answerDto.answerChoice || '',
                                })
                            }
                        }
                    })
                    this.answers.set(finalAnswers)
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

    isFormValid(): boolean {
        return this.questions().every(
            (q) => this.answers()[q.id]?.answerChoice !== undefined,
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
                    .saveExamAnswersByExamScheduleId(this.examId, payload)
                    .pipe(finalize(() => this.submitQuestionLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Penilaian wawancara berhasil disimpan.',
                            )
                            this.draftService
                                .remove(this.examId, this.participantId)
                                .then(() => {
                                    this.backToDashboard()
                                })
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan penilaian wawancara.',
                            )
                        },
                    })
            },
        })
    }

    scheduleAutoSave() {
        clearTimeout(this.saveTimeout)
        this.saveTimeout = window.setTimeout(() => {
            this.draftService.save(
                this.examId,
                this.participantId,
                this.answers(),
            )
        }, 500)
    }
}
