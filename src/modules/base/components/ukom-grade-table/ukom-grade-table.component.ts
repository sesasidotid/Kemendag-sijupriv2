import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output, Input } from '@angular/core'
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
    @Input() gradeData!: UkomGrade
    @Input() rekomendasiUrl: string | null | undefined

    @Output() downloadFile = new EventEmitter<UkomGrade>()

    onDownloadFile() {
        this.downloadFile.emit(this.gradeData)
    }
}
