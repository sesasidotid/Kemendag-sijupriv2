import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { WawancaraExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'

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
    questions: ExamQuestion[] = []
    answers = signal<Record<string, WawancaraExamAnswer>>({})
    private route = inject(ActivatedRoute)
    private handlerService = inject(HandlerService)
    private confirmationService = inject(ConfirmationService)
    private examService = inject(ExamService)

    ngOnInit() {
        this.examId = this.route.snapshot.paramMap.get('id')
        this.participantId = this.route.snapshot.paramMap.get('participantId')
        this.fetchQuestionsToGrade()
    }

    fetchQuestionsToGrade() {
        this.loadingQuestions.set(true)
        this.examService
            .getExamQuestionsByScheduleAndParticipant(
                this.examId,
                this.participantId,
                { page: '1', limit: '1000' },
            )
            .pipe(finalize(() => this.loadingQuestions.set(false)))
            .subscribe({
                next: (result) => {
                    this.questions = result.data

                    const initialAnswers: Record<string, WawancaraExamAnswer> =
                        {}

                    this.questions.forEach((q) => {
                        initialAnswers[q.id] = new WawancaraExamAnswer({
                            questionId: q.id,
                        })
                    })

                    this.answers.set(initialAnswers)
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
        return this.questions.every(
            (q) => this.answers()[q.id]?.answerChoice !== undefined,
        )
    }

    submitAssessment(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.handlerService.handleAlert(
                    'Success',
                    'Penilaian wawancara berhasil disimpan.',
                )
                // TODO: Implement API submission
            },
        })
    }
}
