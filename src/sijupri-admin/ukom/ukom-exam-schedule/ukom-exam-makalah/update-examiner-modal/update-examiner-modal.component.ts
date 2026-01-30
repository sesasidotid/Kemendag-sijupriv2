import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import {
    ParticipantSchedule,
    ScheduleSlot,
} from '@/modules/ukom/models/schedule-slot.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import {
    ColDef,
    GridApi,
    GridReadyEvent,
    RowClassParams,
    SelectionChangedEvent,
} from 'ag-grid-community'

@Component({
    selector: 'app-update-examiner-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, AgGridAngular],
    templateUrl: './update-examiner-modal.component.html',
    styleUrls: ['./update-examiner-modal.component.scss'],
})
export class UpdateExaminerModalComponent implements OnInit {
    @Input() participant!: ParticipantSchedule
    @Input() examinerList: ExaminerScheduleList[] = []
    @Input() currentSlot: ScheduleSlot | null = null

    @Output() close = new EventEmitter<void>()
    @Output() confirm = new EventEmitter<{
        participant: ParticipantSchedule
        examinerId: string
    }>()

    selectedExaminerId: string | null = null
    currentExaminerId: string | null = null
    columnDefs: ColDef[] = [
        {
            headerName: 'Nama Penguji',
            field: 'examinerUkom.user.name',
            flex: 1,
            valueGetter: (params) => {
                const examiner = params.data as ExaminerScheduleList
                return examiner.examinerUkom?.user?.name ?? 'Unknown'
            },
        },
        {
            headerName: 'Username',
            field: 'examinerUkom.nip',
            width: 180,
            valueGetter: (params) => {
                const examiner = params.data as ExaminerScheduleList
                return examiner.examinerUkom?.nip ?? '—'
            },
        },
        {
            headerName: 'Status',
            width: 120,
            cellClass: 'text-center',
            valueGetter: (params) => {
                const examiner = params.data as ExaminerScheduleList
                return this.currentExaminerId === examiner.id ? 'Saat Ini' : ''
            },
            cellRenderer: (params: any) => {
                if (params.value === 'Saat Ini') {
                    return '<span class="badge bg-info">Saat Ini</span>'
                }
                return ''
            },
        },
    ]
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    private gridApi!: GridApi

    ngOnInit(): void {
        // Find current examiner ID based on participant's examiner name
        if (this.participant.examinerName) {
            const currentExaminer = this.examinerList.find(
                (e) =>
                    e.examinerUkom?.user?.name ===
                    this.participant.examinerName,
            )
            if (currentExaminer) {
                this.currentExaminerId = currentExaminer.id
                this.selectedExaminerId = currentExaminer.id
            }
        }
    }

    onConfirm(): void {
        if (this.selectedExaminerId) {
            this.confirm.emit({
                participant: this.participant,
                examinerId: this.selectedExaminerId,
            })
        }
    }

    onClose(): void {
        this.close.emit()
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()

        // Pre-select current examiner in grid
        if (this.currentExaminerId) {
            this.gridApi.forEachNode((node) => {
                if (node.data?.id === this.currentExaminerId) {
                    node.setSelected(true)
                }
            })
        }
    }

    onSelectionChanged(event: SelectionChangedEvent): void {
        const selectedRows = event.api.getSelectedRows()
        this.selectedExaminerId =
            selectedRows.length > 0 ? selectedRows[0].id : null
    }

    getRowClass(params: RowClassParams): string | undefined {
        const examiner = params.data as ExaminerScheduleList
        if (examiner.id === this.currentExaminerId) {
            return 'current-examiner'
        }
        return undefined
    }

    calculateGridHeight(): string {
        const rowCount = this.examinerList.length
        const headerHeight = 48
        const rowHeight = 42

        // Total = Header + (Rows * Height) + 2px for top/bottom borders
        const totalHeight = headerHeight + rowCount * rowHeight + 2

        return `${totalHeight + 1}px`
    }
}
