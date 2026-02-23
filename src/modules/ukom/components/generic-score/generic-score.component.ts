import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    BaseScore,
    MakalahScore,
    PortofolioScore,
    PraktikScore,
    StudiKasusScore,
} from '@/modules/ukom/models/exam/exam-score.model'

type GenericScore =
    | PortofolioScore
    | StudiKasusScore
    | PraktikScore
    | MakalahScore

@Component({
    selector: 'app-generic-score',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './generic-score.component.html',
    styleUrl: './generic-score.component.scss',
})
export class GenericScoreComponent {
    @Input() score: GenericScore | null = null
    @Input() examTypeName: string = 'Ujian'

    /**
     * Gets question list with proper typing
     */
    get questionList(): any[] {
        return this.score?.questionDtoList || []
    }

    /**
     * Calculates the total score for questions with score property
     */
    getTotalScore(): number {
        if (!this.questionList.length) {
            return 0
        }

        return this.questionList.reduce((sum: number, question: any) => {
            const questionScore = question.answerDto?.score || 0
            return sum + questionScore
        }, 0)
    }

    /**
     * Gets the maximum possible score based on weights
     */
    getMaxScore(): number {
        if (!this.questionList.length) {
            return 0
        }

        return this.questionList.reduce((sum: number, question: any) => {
            return sum + (question.weight || 0)
        }, 0)
    }

    /**
     * Calculates percentage if max score is available
     */
    getPercentage(): number {
        const total = this.getTotalScore()
        const max = this.getMaxScore()

        if (max === 0) return 0
        return Math.round((total / max) * 100)
    }

    /**
     * Gets badge class based on percentage
     */
    getBadgeClass(percentage: number): string {
        if (percentage >= 70) return 'bg-success'
        if (percentage >= 50) return 'bg-warning'
        return 'bg-danger'
    }

    /**
     * Checks if a question has a file upload
     */
    hasUpload(question: any): boolean {
        return !!(
            question.answerDto?.answerUpload ||
            question.answerDto?.answerUploadUrl
        )
    }

    /**
     * Gets validation status for portfolio items
     */
    getValidationStatus(
        question: any,
    ): { memadai: boolean; valid: boolean } | null {
        if (question.answerDto?.answerList) {
            return question.answerDto.answerList
        }
        return null
    }
}
