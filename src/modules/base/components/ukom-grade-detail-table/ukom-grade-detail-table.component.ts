import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UkomGrade } from '../../../ukom/models/ukom-grade'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'
import { RoomUkom } from '@/modules/ukom/models/cat/room-ukom.model'

@Component({
    selector: 'app-ukom-grade-detail-table',
    standalone: true,
    imports: [CommonModule, TruncateDecimalPipe],
    templateUrl: './ukom-grade-detail-table.component.html',
    styleUrl: './ukom-grade-detail-table.component.scss',
})
export class UkomGradeDetailTableComponent {
    @Input() nip: string = ''
    @Input() nama: string = ''
    @Input() roomUkomData: RoomUkom
    @Input() gradeData: UkomGrade

    get totalSeminarMakalahScore(): number | string {
        const seminar = this.gradeData?.seminarGrade?.score
        const makalah = this.gradeData?.makalahGrade?.score

        if (seminar == null && makalah == null) return '-'
        return (Number(seminar) ?? 0) + (Number(makalah) ?? 0)
    }


}
