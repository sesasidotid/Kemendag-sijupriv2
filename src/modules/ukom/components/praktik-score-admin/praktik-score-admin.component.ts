import { Component, computed, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PraktikScore } from '@/modules/ukom/models/exam/exam-score.model'

@Component({
    selector: 'app-praktik-score-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './praktik-score-admin.component.html',
    styleUrls: ['./praktik-score-admin.component.scss'],
})
export class PraktikScoreAdminComponent {
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
        return !!(question.answerDto?.answerUpload || question.answerDto?.answerUploadUrl)
    }

    getAnswerText(question: any): string {
         return question.answerDto?.answerText || '';
    }
}

