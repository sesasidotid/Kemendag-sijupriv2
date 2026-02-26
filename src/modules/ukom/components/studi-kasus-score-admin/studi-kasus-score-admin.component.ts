import { Component, computed, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { StudiKasusScore } from '@/modules/ukom/models/exam/exam-score.model'

@Component({
    selector: 'app-studi-kasus-score-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './studi-kasus-score-admin.component.html',
    styleUrls: ['./studi-kasus-score-admin.component.scss'],
})
export class StudiKasusScoreAdminComponent {
    score = input<StudiKasusScore | null>(null)
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

    getAnswerScore(question: any): number {
        return question.answerDto?.score ?? 0
    }

    getAnswerText(question: any): string {
        return question.answerDto?.answerText || ''
    }
}
