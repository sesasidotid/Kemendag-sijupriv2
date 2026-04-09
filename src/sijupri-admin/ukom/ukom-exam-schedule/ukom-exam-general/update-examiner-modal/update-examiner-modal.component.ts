import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import {
    ColDef,
    GridApi,
    GridReadyEvent,
    RowClassParams,
    SelectionChangedEvent,
} from 'ag-grid-community'

/**
 * Modal for updating examiners for a participant
 * Supports multiple examiner selection
 */
@Component({
    selector: 'app-update-examiner-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, AgGridAngular],
    templateUrl: './update-examiner-modal.component.html',
    styleUrls: ['./update-examiner-modal.component.scss'],
})
export class UpdateExaminerModalComponent implements OnInit {
    @Input() participant!: ParticipantScheduleList
    @Input() examinerList: ExaminerScheduleList[] = []

    @Output() close = new EventEmitter<void>()
    @Output() confirm = new EventEmitter<{
        participant: ParticipantScheduleList
        examinerIds: string[]
    }>()

    selectedExaminerIds = signal<string[]>([])
    currentExaminerIds = signal<string[]>([])
    selectedExaminerId = signal<string | null>(null) // Single examiner selection

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
                return this.currentExaminerIds().includes(examiner.id)
                    ? 'Saat Ini'
                    : ''
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
        // Get current examiner IDs from participant's examScheduleSupervised
        if (this.participant.examScheduleSupervised) {
            const supervisedData = this.participant.examScheduleSupervised
            const supervisedList = Array.isArray(supervisedData)
                ? supervisedData
                : [supervisedData]

            const currentIds = supervisedList.map(
                (supervised) => supervised.examinerScheduleId,
            )
            this.currentExaminerIds.set(currentIds)
            if (currentIds.length > 0) {
                this.selectedExaminerId.set(currentIds[0])
                this.selectedExaminerIds.set([currentIds[0]])
            }
        }
    }

    onConfirm(): void {
        const selectedId = this.selectedExaminerId()
        if (selectedId) {
            this.confirm.emit({
                participant: this.participant,
                examinerIds: [selectedId], // Always send as single-item array
            })
        }
    }

    onClose(): void {
        this.close.emit()
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()

        // Pre-select first current examiner in grid (single selection)
        const currentIds = this.currentExaminerIds()
        if (currentIds.length > 0) {
            const firstExaminerId = currentIds[0]
            this.gridApi.forEachNode((node) => {
                if (node.data?.id === firstExaminerId) {
                    node.setSelected(true)
                }
            })
        }
    }

    onSelectionChanged(event: SelectionChangedEvent): void {
        const selectedRows = event.api.getSelectedRows()

        // Only allow single selection - keep only the last selected
        if (selectedRows.length > 1) {
            // Deselect all except the last one
            const lastSelected = selectedRows[selectedRows.length - 1]
            event.api.forEachNode((node) => {
                if (node.data?.id !== lastSelected.id) {
                    node.setSelected(false)
                }
            })
            this.selectedExaminerId.set(lastSelected.id)
            this.selectedExaminerIds.set([lastSelected.id])
        } else if (selectedRows.length === 1) {
            this.selectedExaminerId.set(selectedRows[0].id)
            this.selectedExaminerIds.set([selectedRows[0].id])
        } else {
            this.selectedExaminerId.set(null)
            this.selectedExaminerIds.set([])
        }
    }

    getRowClass(params: RowClassParams): string | undefined {
        const examiner = params.data as ExaminerScheduleList
        if (this.currentExaminerIds().includes(examiner.id)) {
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

        return `${Math.min(totalHeight + 1, 400)}px` // Max height 400px
    }

    getSelectedExaminerNames(): string {
        const selectedId = this.selectedExaminerId()
        if (!selectedId) {
            return 'Belum ada penguji dipilih'
        }

        const examiner = this.examinerList.find((e) => e.id === selectedId)
        return examiner?.examinerUkom?.user?.name || 'Unknown'
    }
}
