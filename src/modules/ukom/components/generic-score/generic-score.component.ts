import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BaseScore } from '@/modules/ukom/models/exam/exam-score.model'

@Component({
    selector: 'app-generic-score',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './generic-score.component.html',
    styleUrl: './generic-score.component.scss',
})
export class GenericScoreComponent {
    @Input() score: BaseScore | null = null
    @Input() examTypeName: string = 'Ujian'
}
