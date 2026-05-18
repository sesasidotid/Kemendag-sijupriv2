import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UkomGrade } from '../../../ukom/models/ukom-grade'

@Component({
    selector: 'app-ukom-grade-table',
    standalone: true,
    templateUrl: './ukom-grade-table.component.html',
    styleUrls: ['./ukom-grade-table.component.scss'],
    imports: [CommonModule],
})
export class UkomGradeTableComponent {
    @Input() nip: string = ''
    @Input() nama: string = ''
    @Input() gradeData: UkomGrade
    @Input() rekomendasiUrl: string | null | undefined

    @Output() downloadFile = new EventEmitter<UkomGrade>()

    get totalSeminarMakalahScore(): number | string {
        const seminar = this.gradeData?.seminarGrade?.score
        const makalah = this.gradeData?.makalahGrade?.score

        if (seminar == null && makalah == null) return '-'
        return (Number(seminar) ?? 0) + (Number(makalah) ?? 0)
    }

    onDownloadFile() {
        this.downloadFile.emit(this.gradeData)
    }
}
