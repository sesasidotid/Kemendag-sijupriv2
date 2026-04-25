import { Component, computed, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PraktikScore } from '@/modules/ukom/models/exam/exam-score.model'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'

@Component({
    selector: 'app-praktik-score-admin',
    standalone: true,
    imports: [CommonModule, TruncateDecimalPipe],
    templateUrl: './praktik-score-admin.component.html',
    styleUrls: ['./praktik-score-admin.component.scss'],
})
export class PraktikScoreAdminComponent {
    // TODO: Add participant answer, the link and the file if any
    score = input<PraktikScore | null>(null)

    groupedQuestions = computed(() => {
        const list = this.score()?.questionDtoList || []
        const parents = list.filter((q) => !q.parentQuestionId)
        return parents.map((parent) => ({
            parent,
            children: list.filter((q) => q.parentQuestionId === parent.id),
        }))
    })

    hasUpload(question: any): boolean {
        return !!(
            question.answerDto?.answerUpload ||
            question.answerDto?.answerUploadUrl
        )
    }

    getAnswerText(question: any): string {
        return question.answerDto?.answerText || ''
    }

    getAnswerScore(question: any): number {
        return question.answerDto?.score ?? 0
    }
}
