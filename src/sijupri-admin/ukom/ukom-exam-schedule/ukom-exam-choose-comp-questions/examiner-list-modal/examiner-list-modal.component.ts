import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'

@Component({
    selector: 'app-examiner-list-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, AgGridAngular],
    templateUrl: './examiner-list-modal.component.html',
    styleUrls: ['./examiner-list-modal.component.scss'],
})
export class ExaminerListModalComponent implements OnInit {
    @Input() examinerList: ExaminerScheduleList[] = []
    @Input() examTypeCode: string = ''

    @Output() close = new EventEmitter<void>()
    columnDefs: ColDef[] = [
        {
            headerName: 'No',
            width: 70,
            cellClass: 'text-center',
            valueGetter: (params) => params.node!.rowIndex! + 1,
        },
        {
            headerName: 'Username',
            field: 'examinerUkom.nip',
            width: 180,
            valueGetter: (params) => {
                const examiner = params.data as ExaminerScheduleList
                return examiner.examinerUkom?.nip || '—'
            },
        },
        {
            headerName: 'Nama',
            field: 'examinerUkom.user.name',
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => {
                const examiner = params.data as ExaminerScheduleList
                return examiner.examinerUkom?.user?.name || '—'
            },
        },
    ]
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    private gridApi!: GridApi

    ngOnInit(): void {}

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    onClose(): void {
        this.close.emit()
    }
}
