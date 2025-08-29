import { Component, Input } from '@angular/core';
import { UkomGrade } from '../../../ukom/models/ukom-grade';
import { PagableBuilder } from '../../commons/pagable/pagable-builder';
import { Pagable } from '../../commons/pagable/pagable';
@Component({
    selector: 'app-ukom-grade-table',
    standalone: true,   // 👈 add this
    templateUrl: './ukom-grade-table.component.html',
    styleUrls: ['./ukom-grade-table.component.scss']
})
export class UkomGradeTableComponent {
    @Input() nip: string = '';
    @Input() nama: string = '';
    @Input() gradeData!: UkomGrade;
}
