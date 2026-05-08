import { CommonModule } from '@angular/common'
import { Component, effect, inject, input, signal } from '@angular/core'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { VideoPreviewComponent } from '@/modules/base/components/video-preview/video-preview.component'

@Component({
    selector: 'app-preview-practical-work',
    standalone: true,
    imports: [CommonModule, VideoPreviewComponent],
    templateUrl: './preview-practical-work.component.html',
    styleUrl: './preview-practical-work.component.scss',
})
export class PreviewPracticalWorkComponent {
    examScheduleId = input.required<string>()
    participantId = input.required<string>()

    loadingQuestions = signal(false)
    questions = signal<ExamQuestion[]>([])
    participantAnswer = signal<ExamQuestion | null>(null)

    private examService = inject(ExamService)

    constructor() {
        effect(
            () => {
                const examId = this.examScheduleId()
                const participantId = this.participantId()

                if (!examId || !participantId) {
                    this.questions.set([])
                    this.participantAnswer.set(null)
                    return
                }

                this.fetchQuestions(examId, participantId)
            },
            { allowSignalWrites: true },
        )
    }

    private fetchQuestions(examId: string, participantId: string): void {
        this.loadingQuestions.set(true)
        this.examService
            .getExamQuestionsByScheduleAndParticipant(examId, participantId, {
                page: '1',
                limit: '1000',
            })
            .pipe(finalize(() => this.loadingQuestions.set(false)))
            .subscribe({
                next: (result) => {
                    const data = result.data
                    const baseQuestion = data.find(
                        (item) => item.id === 'base_praktik_question',
                    )
                    const otherQuestions = data.filter(
                        (item) => item.id !== 'base_praktik_question',
                    )

                    this.participantAnswer.set(baseQuestion || null)
                    this.questions.set(otherQuestions)
                },
                error: (err) => {
                    console.error(err)
                    this.questions.set([])
                    this.participantAnswer.set(null)
                },
            })
    }

    openAnswer(): void {
        const url = this.participantAnswer()?.answerDto?.answerUploadUrl
        if (url) {
            window.open(url, '_blank')
        }
    }
}
