import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PortofolioScore } from '@/modules/ukom/models/exam/exam-score.model'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'

@Component({
    selector: 'app-portofolio-score-admin',
    standalone: true,
    imports: [CommonModule, TruncateDecimalPipe],
    templateUrl: './portofolio-score-admin.component.html',
    styleUrls: ['./portofolio-score-admin.component.scss'],
})
export class PortofolioScoreAdminComponent {
    score = input<PortofolioScore | null>(null)

    hasUpload(question: any): boolean {
        return !!(
            question.answerDto?.answerUpload ||
            question.answerDto?.answerUploadUrl
        )
    }
}
