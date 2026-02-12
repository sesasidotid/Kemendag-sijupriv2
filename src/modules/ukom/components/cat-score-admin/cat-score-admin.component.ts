import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CATScore } from '@/modules/ukom/models/exam/exam-score.model'
import { CATIndicatorCompetency } from '@/modules/ukom/models/cat/cat-indicator-competency.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'

interface CompetencyGroup {
    name: string
    items: CATIndicatorCompetency[]
    total: number
    correct: number
    percentage: number
}

@Component({
    selector: 'app-cat-score-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cat-score-admin.component.html',
    styleUrl: './cat-score-admin.component.scss',
})
export class CatScoreAdminComponent {
    @Input() score: CATScore | null = null

    /**
     * Groups competencies by kompetensiId and calculates statistics
     */
    getGroupedCompetencies(): CompetencyGroup[] {
        if (!this.score?.kompetensiIndikatorDtoList) {
            return []
        }

        type GroupResult = {
            name: string
            items: CATIndicatorCompetency[]
            total: number
            correct: number
        }

        const grouped = this.score.kompetensiIndikatorDtoList.reduce(
            (acc, kompetensi) => {
                const key = kompetensi.kompetensiId || 'default'
                acc[key] ??= {
                    name: kompetensi.kompetensiName ?? '-',
                    items: [],
                    total: 0,
                    correct: 0,
                }
                acc[key].items.push(kompetensi)
                acc[key].total += kompetensi.questionDtoList?.length ?? 0
                acc[key].correct += this.getCorrectAnswersCount(kompetensi)

                return acc
            },
            {} as Record<string, GroupResult>,
        )

        return Object.values(grouped).map((group) => ({
            ...group,
            percentage:
                group.total > 0
                    ? Math.round((group.correct / group.total) * 100)
                    : 0,
        }))
    }

    /**
     * Gets the correct answer choice ID for a question
     */
    getCorrectAnswer(question: CATQuestions): string {
        const correctChoice = question.multipleChoiceDtoList?.find(
            (choice) => choice.correct,
        )
        return correctChoice ? correctChoice.choiceId : ''
    }

    /**
     * Calculates percentage for a specific indicator competency
     */
    getIndicatorPercentage(kompetensi: CATIndicatorCompetency): number {
        if (
            !kompetensi.questionDtoList ||
            kompetensi.questionDtoList.length === 0
        ) {
            return 0
        }

        const correctAnswers = this.getCorrectAnswersCount(kompetensi)
        const totalQuestions = kompetensi.questionDtoList.length

        return Math.round((correctAnswers / totalQuestions) * 100)
    }

    /**
     * Counts correct answers for an indicator
     */
    getCorrectAnswersCount(kompetensi: CATIndicatorCompetency): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return kompetensi.questionDtoList.filter(
            (question) =>
                question.answerDto?.answerChoice ===
                this.getCorrectAnswer(question),
        ).length
    }

    /**
     * Counts wrong answers for an indicator
     */
    getWrongAnswersCount(kompetensi: CATIndicatorCompetency): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return (
            kompetensi.questionDtoList.length -
            this.getCorrectAnswersCount(kompetensi)
        )
    }

    /**
     * Gets the choice text for a given choice ID
     */
    getChoiceText(question: CATQuestions, choiceId: string): string {
        const choice = question.multipleChoiceDtoList?.find(
            (c) => c.choiceId === choiceId,
        )
        return choice ? choice.choiceValue : '-'
    }

    /**
     * Checks if an answer is correct
     */
    isAnswerCorrect(question: CATQuestions): boolean {
        return (
            question.answerDto?.answerChoice === this.getCorrectAnswer(question)
        )
    }
}
