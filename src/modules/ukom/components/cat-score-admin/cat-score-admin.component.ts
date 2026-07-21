import { Component, computed, input, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CATScore } from '@/modules/ukom/models/exam/exam-score.model'
import { CATIndicatorCompetency } from '@/modules/ukom/models/cat/cat-indicator-competency.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'

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
    imports: [CommonModule, TruncateDecimalPipe],
    templateUrl: './cat-score-admin.component.html',
    styleUrl: './cat-score-admin.component.scss',
})
export class CatScoreAdminComponent {
    score = input<CATScore | null>(null)
    showAnswerDetails = signal(false)

    toggleAnswerDetails(): void {
        this.showAnswerDetails.update((value) => !value)
    }

    groupedCompetencies = computed(() => {
        const score = this.score()
        if (!score?.kompetensiIndikatorDtoList) {
            return []
        }

        type GroupResult = {
            name: string
            items: CATIndicatorCompetency[]
            total: number
            correct: number
        }

        const grouped = score.kompetensiIndikatorDtoList.reduce(
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
    })

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
