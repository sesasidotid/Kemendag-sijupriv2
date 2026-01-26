import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ActivatedRoute } from '@angular/router'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'

@Component({
    selector: 'app-studi-kasus',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './studi-kasus.component.html',
    styleUrls: ['./studi-kasus.component.scss'],
})
export class StudiKasusComponent implements OnInit {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    route = inject(ActivatedRoute)
    loadingQuestions = signal(false)
    examService = inject(ExamService)
    examId = signal('')
    participantId = signal('')

    questions = signal<ExamQuestion[]>([])

    participantAnswer = signal<ExamQuestion | null>(null)

    constructor() {
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

    get finalScore(): number {
        const items = this.questions()
        const scoredItems = items.filter(
            (item) =>
                item.answerDto?.score !== null &&
                item.answerDto?.score !== undefined,
        )
        if (scoredItems.length === 0) return 0

        const totalMaxScore = scoredItems.reduce(
            (sum, item) => sum + (item.weight || 100),
            0,
        )
        const totalScore = scoredItems.reduce(
            (sum, item) => sum + (item.answerDto?.score || 0),
            0,
        )
        return Math.round((totalScore / totalMaxScore) * 100)
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
                        (item) => item.id === 'base_studi_kasus_question',
                    )
                    const otherQuestions = data.filter(
                        (item) => item.id !== 'base_studi_kasus_question',
                    )
                    this.participantAnswer.set(baseQuestion || null)
                    // Ensure each question has answerDto initialized
                    otherQuestions.forEach((q) => {
                        if (!q.answerDto) {
                            q.answerDto = {
                                participantId: this.participantId(),
                                questionId: q.id,
                                score: null,
                                answerText: null,
                            }
                        }
                    })
                    this.questions.set(otherQuestions)
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
            this.participantAnswer().answerDto?.answerUploadUrl,
            '_blank',
        )
    }

    validateScore(item: ExamQuestion): void {
        if (
            item.answerDto &&
            item.answerDto.score !== null &&
            item.answerDto.score !== undefined
        ) {
            const maxScore = item.weight || 100
            if (item.answerDto.score < 0) item.answerDto.score = 0
            if (item.answerDto.score > maxScore) item.answerDto.score = maxScore
        }
    }

    submitAssessment(): void {
        const items = this.questions()
        const hasEmptyScores = items.some(
            (item) =>
                item.answerDto?.score === null ||
                item.answerDto?.score === undefined,
        )

        if (hasEmptyScores) {
            if (
                !confirm(
                    'Masih ada aspek yang belum dinilai (Nilai 0). Lanjutkan penyimpanan?',
                )
            ) {
                return
            }
        }

        const payload = {
            items: items.map((item) => ({
                questionId: item.id,
                score: item.answerDto?.score,
                answerText: item.answerDto?.answerText,
                weight: item.weight,
            })),
            finalScore: this.finalScore,
        }

        console.log('Submitting Case Study Assessment:', payload)
        alert(
            `Penilaian Studi Kasus disimpan.\nNilai Akhir: ${this.finalScore}`,
        )
    }
}
