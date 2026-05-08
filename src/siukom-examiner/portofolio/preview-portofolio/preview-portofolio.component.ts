import { CommonModule } from '@angular/common'
import { Component, effect, inject, input, signal } from '@angular/core'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'

@Component({
    selector: 'app-preview-portofolio',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preview-portofolio.component.html',
    styleUrl: './preview-portofolio.component.scss',
})
export class PreviewPortofolioComponent {
    examScheduleId = input.required<string>()
    participantId = input.required<string>()

    loadingQuestions = signal(false)
    questions = signal<ExamQuestion[]>([])

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

    openDocument(url: string): void {
        if (url) {
            window.open(url, '_blank')
        }
    }

    getCheckboxState(
        question: ExamQuestion,
        controlName: 'valid' | 'memadai',
    ): 'checked' | 'unchecked' | 'unanswered' {
        const value = (question.answerDto?.answerList as any)?.[controlName]

        if (value === null || value === undefined) {
            return 'unanswered'
        }
        return value === true ? 'checked' : 'unchecked'
    }

    isItemCompetent(question: ExamQuestion): boolean {
        const answerList = question.answerDto?.answerList as
            | { valid?: boolean | null; memadai?: boolean | null }
            | undefined
        return answerList?.valid === true && answerList?.memadai === true
    }
}
