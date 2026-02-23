import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MakalahScore } from '@/modules/ukom/models/exam/exam-score.model'

@Component({
    selector: 'app-makalah-score-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './makalah-score-admin.component.html',
    styleUrls: ['./makalah-score-admin.component.scss'],
})
export class MakalahScoreAdminComponent {
    score = input<MakalahScore | null>(null)
}

