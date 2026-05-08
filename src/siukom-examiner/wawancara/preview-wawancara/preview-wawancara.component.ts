import { CommonModule } from '@angular/common'
import { Component, effect, inject, input, signal } from '@angular/core'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'

@Component({
    selector: 'app-preview-wawancara',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preview-wawancara.component.html',
    styleUrl: './preview-wawancara.component.scss',
})
export class PreviewWawancaraComponent {
    examScheduleId = input.required<string>()
    participantId = input.required<string>()

    loadingQuestions = signal(false)
    questions = signal<ExamQuestion[]>([])
    visibleHints = signal<Record<string, boolean>>({})

    private examService = inject(ExamService)

    constructor() {
        effect(
            () => {
                const examId = this.examScheduleId()
                const participantId = this.participantId()

                if (!examId || !participantId) {
                    this.questions.set([])
                    return
                }

                this.fetchQuestions(examId, participantId)
            },
            { allowSignalWrites: true },
        )
    }

    hasHint(question: ExamQuestion): boolean {
        return !!question.hint?.trim()
    }

    toggleHint(question: ExamQuestion, index: number): void {
        const key = this.getHintKey(question, index)
        this.visibleHints.update((state) => ({
            ...state,
            [key]: !state[key],
        }))
    }

    isHintVisible(question: ExamQuestion, index: number): boolean {
        const key = this.getHintKey(question, index)
        return !!this.visibleHints()[key]
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
                    this.questions.set(result.data)
                },
                error: (err) => {
                    console.error(err)
                    this.questions.set([])
                },
            })
    }

    private getHintKey(question: ExamQuestion, index: number): string {
        return question.id || `index-${index}`
    }
}
