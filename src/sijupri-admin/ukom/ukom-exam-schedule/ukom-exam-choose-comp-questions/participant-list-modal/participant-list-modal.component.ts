import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import {
    ColDef,
    GridApi,
    GridReadyEvent,
    RowClassRules,
} from 'ag-grid-community'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { ScheduleSlotService } from '@/modules/ukom/services/schedule-slot.service'

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

    jenisUkomService = inject(JenisUkomService)
    slotService = inject(ScheduleSlotService)
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
            width: 180,
            valueGetter: (params) => {
                const participant = params.data as ParticipantScheduleList
                return (
                    this.jenisUkomService.getLabelByValue(
                        participant.participantUkom?.jenisUkom,
                    ) || '—'
                )
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

    rowClassRules: RowClassRules = {
        'row-has-schedule': (params) => {
            const data = params.data as ParticipantScheduleList
            return !!data.personalSchedule
        },
    }

    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    private gridApi!: GridApi

    ngOnInit(): void {
        if (this.examTypeCode === ExamTypeCategory.CAT) {
            this.columnDefs = [
                ...this.columnDefs,
                {
                    headerName: 'Waktu Mulai',
                    field: 'examAttendance.startAt',
                    width: 150,
                    valueGetter: (params) => {
                        const participant =
                            params.data as ParticipantScheduleList
                        return participant.examAttendance?.startAt || '—'
                    },
                },
                {
                    headerName: 'Waktu Selesai',
                    field: 'examAttendance?.finishAt ',
                    width: 150,
                    valueGetter: (params) => {
                        const participant =
                            params.data as ParticipantScheduleList
                        return participant.examAttendance?.finishAt || '—'
                    },
                },
                        {
                    headerName: 'Jumlah Pelanggaran',
                    field: 'examAttendance?.violationCount',
                    width: 150,
                    valueGetter: (params) => {
                        const participant =
                            params.data as ParticipantScheduleList
                        return participant.examAttendance?.violationCount || '—'
                    },
                },
                {
                    headerName: 'Status Ujian',
                    field: 'examAttendance?.status',
                    width: 150,
                    valueGetter: (params) => {
                        const participant =
                            params.data as ParticipantScheduleList
                        return participant.examAttendance?.status || '—'
                    },
                },
            ]
        }

        if (
            this.examTypeCode &&
            ![
                ExamTypeCategory.CAT,
                ExamTypeCategory.PORTOFOLIO,
                ExamTypeCategory.STUDI_KASUS,
            ].includes(this.examTypeCode as ExamTypeCategory)
        ) {
            this.columnDefs = [
                ...this.columnDefs,
                {
                    headerName: 'Jadwal Peserta',
                    field: 'personalSchedule',
                    width: 200,
                    valueGetter: (params) => {
                        const participant =
                            params.data as ParticipantScheduleList
                        // return participant.personalSchedule || '—'
                        return this.slotService.formatDateTime(
                            this.slotService.parseAsUTC7(
                                participant.personalSchedule,
                            ),
                        )
                    },
                },
            ]
        }
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    onClose(): void {
        this.close.emit()
    }
}
