import { Component, computed, input, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    WawancaraExaminerGrade,
    WawancaraQuestionDto,
    WawancaraScore,
} from '@/modules/ukom/models/exam/exam-score.model'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'

@Component({
    selector: 'app-wawancara-score-admin',
    standalone: true,
    imports: [CommonModule, TruncateDecimalPipe],
    templateUrl: './wawancara-score-admin.component.html',
    styleUrls: ['./wawancara-score-admin.component.scss'],
})
export class WawancaraScoreAdminComponent {
    score = input<WawancaraScore | null>(null)

    /** Rincian per penguji; kosong untuk data lama (satu lembar nilai bersama) */
    examinerGrades = computed<WawancaraExaminerGrade[]>(
        () => this.score()?.examinerGradeDtoList ?? [],
    )

    selectedExaminerIndex = signal(0)

    selectedExaminer = computed<WawancaraExaminerGrade | null>(
        () => this.examinerGrades()[this.selectedExaminerIndex()] ?? null,
    )

    /** Pertanyaan yang ditampilkan: milik penguji terpilih, atau lembar bersama (data lama) */
    displayedQuestions = computed<WawancaraQuestionDto[]>(() =>
        this.examinerGrades().length
            ? (this.selectedExaminer()?.questionDtoList ?? [])
            : (this.score()?.questionDtoList ?? []),
    )

    selectExaminer(index: number): void {
        this.selectedExaminerIndex.set(index)
    }
}
