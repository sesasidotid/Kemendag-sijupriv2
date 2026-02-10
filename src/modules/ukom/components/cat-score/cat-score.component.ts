import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CATScore } from '@/modules/ukom/models/exam/exam-score.model'
import { CATIndicatorCompetency } from '@/modules/ukom/models/cat/cat-indicator-competency.model'
import { CATQuestions } from '@/modules/ukom/models/cat/cat-questions'

@Component({
    selector: 'app-cat-score',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cat-score.component.html',
    styleUrl: './cat-score.component.scss',
})
export class CatScoreComponent {
    @Input() score: CATScore | null = null

    getGroupedCompetencies() {
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
                const key = kompetensi.kompetensiId
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

    getCorrectAnswer(question: CATQuestions): string {
        const correctChoice = question.multipleChoiceDtoList.find(
            (choice) => choice.correct,
        )
        return correctChoice ? correctChoice.choiceId : ''
    }

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
}
