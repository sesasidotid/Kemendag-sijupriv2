import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'

@Component({
    selector: 'app-participant-list-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, AgGridAngular],
    templateUrl: './participant-list-modal.component.html',
    styleUrls: ['./participant-list-modal.component.scss'],
})
export class ParticipantListModalComponent implements OnInit {
    @Input() participantList: ParticipantScheduleList[] = []
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
            headerName: 'Nama',
            field: 'participantUkom.name',
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return participant.participantUkom?.name || '—'
            },
        },
        {
            headerName: 'NIP',
            field: 'participantUkom.nip',
            width: 180,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return participant.participantUkom?.nip || '—'
            },
        },
        {
            headerName: 'Email',
            field: 'participantUkom.user.email',
            flex: 1,
            minWidth: 220,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return participant.participantUkom?.email || '—'
            },
        },
        {
            headerName: 'Jenis UKOM',
            field: 'participantUkom.jenisUkom',
            width: 120,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return participant.participantUkom?.jenisUkom || '—'
            },
        },
        {
            headerName: 'Jabatan',
            field: 'participantUkom.jabatanName',
            width: 180,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return participant.participantUkom?.jabatanName || '—'
            },
        },
        {
            headerName: 'Jenjang',
            field: 'participantUkom.jenjangName',
            width: 150,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return participant.participantUkom?.jenjangName || '—'
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
