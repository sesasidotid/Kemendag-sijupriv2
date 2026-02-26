import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WawancaraScore } from '@/modules/ukom/models/exam/exam-score.model'

@Component({
    selector: 'app-wawancara-score-admin',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wawancara-score-admin.component.html',
    styleUrls: ['./wawancara-score-admin.component.scss'],
})
export class WawancaraScoreAdminComponent {
    score = input<WawancaraScore | null>(null)
}
