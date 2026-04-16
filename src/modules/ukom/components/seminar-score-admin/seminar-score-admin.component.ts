import { Component, computed, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SeminarScore } from '@/modules/ukom/models/exam/exam-score.model'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'

@Component({
    selector: 'app-seminar-score-admin',
    standalone: true,
    imports: [CommonModule, TruncateDecimalPipe],
    templateUrl: './seminar-score-admin.component.html',
    styleUrls: ['./seminar-score-admin.component.scss'],
})
export class SeminarScoreAdminComponent {
    score = input<SeminarScore | null>(null)

    groupedQuestions = computed(() => {
        const list = this.score()?.questionDtoList || []
        const parents = list.filter((q: any) => !q.parentQuestionId)
        return parents.map((parent: any) => ({
            parent,
            children: list.filter((q: any) => q.parentQuestionId === parent.id),
        }))
    })

    hasUpload(question: any): boolean {
        return !!(
            question.answerDto?.answerUpload ||
            question.answerDto?.answerUploadUrl
        )
    }

    getAnswerScore(question: any): number {
        return question.answerDto?.score ?? 0
    }

    getAnswerText(question: any): string {
        return question.answerDto?.answerText || ''
    }
}
