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
        examinerIds: string[]
    }>()

    /** Batas jumlah penguji wawancara — harus sama dengan maxExaminerFor() di backend */
    @Input() minExaminerCount = 1
    /** null = tanpa batas (wawancara boleh banyak penguji) */
    @Input() maxExaminerCount: number | null = null

    selectedExaminerIds: string[] = []
    currentExaminerIds: string[] = []
    columnDefs: ColDef[] = [
        {
            checkboxSelection: true,
            width: 50,
            maxWidth: 50,
            sortable: false,
            filter: false,
            resizable: false,
        },
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
                return this.currentExaminerIds.includes(examiner.id)
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
        const availableIds = new Set(this.examinerList.map((e) => e.id))

        if (this.participant.examinerIds?.length) {
            // Preferred: use examiner_schedule IDs resolved by the parent
            this.currentExaminerIds = this.participant.examinerIds.filter(
                (id) => availableIds.has(id),
            )
        } else if (this.participant.examinerName) {
            // Fallback: match by examiner name(s)
            const names = this.participant.examinerName
                .split(',')
                .map((n) => n.trim())
            this.currentExaminerIds = this.examinerList
                .filter((e) => names.includes(e.examinerUkom?.user?.name ?? ''))
                .map((e) => e.id)
        }

        if (this.maxExaminerCount !== null) {
            this.currentExaminerIds = this.currentExaminerIds.slice(
                0,
                this.maxExaminerCount,
            )
        }
        this.selectedExaminerIds = [...this.currentExaminerIds]
    }

    get isSelectionValid(): boolean {
        const count = this.selectedExaminerIds.length
        return (
            count >= this.minExaminerCount &&
            (this.maxExaminerCount === null || count <= this.maxExaminerCount)
        )
    }

    get isUnchanged(): boolean {
        const a = [...this.selectedExaminerIds].sort()
        const b = [...this.currentExaminerIds].sort()
        return a.length === b.length && a.every((id, i) => id === b[i])
    }

    get selectedExaminerNames(): string[] {
        return this.selectedExaminerIds.map(
            (id) =>
                this.examinerList.find((e) => e.id === id)?.examinerUkom?.user
                    ?.name ?? 'Unknown',
        )
    }

    onConfirm(): void {
        if (!this.isSelectionValid) return
        if (this.isUnchanged) {
            this.close.emit()
            return
        }

        this.confirm.emit({
            participant: this.participant,
            examinerIds: [...this.selectedExaminerIds],
        })
    }

    onClose(): void {
        this.close.emit()
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()

        // Pre-select current examiners in grid
        if (this.currentExaminerIds.length > 0) {
            this.gridApi.forEachNode((node) => {
                if (this.currentExaminerIds.includes(node.data?.id)) {
                    node.setSelected(true)
                }
            })
        }
    }

    onSelectionChanged(event: SelectionChangedEvent): void {
        const selectedIds = (
            event.api.getSelectedRows() as ExaminerScheduleList[]
        ).map((row) => row.id)

        if (
            this.maxExaminerCount !== null &&
            selectedIds.length > this.maxExaminerCount
        ) {
            // Keep previous selection, deselect the newly added row(s)
            const newlyAdded = selectedIds.filter(
                (id) => !this.selectedExaminerIds.includes(id),
            )
            event.api.forEachNode((node) => {
                if (newlyAdded.includes(node.data?.id)) {
                    node.setSelected(false)
                }
            })
            return
        }

        this.selectedExaminerIds = selectedIds
    }

    getRowClass(params: RowClassParams): string | undefined {
        const examiner = params.data as ExaminerScheduleList
        if (this.currentExaminerIds.includes(examiner.id)) {
            return 'current-examiner'
        }
        return undefined
    }

    calculateGridHeight(): string {
        const rowCount = this.examinerList.length
        const headerHeight = 48
        const rowHeight = 42

        // Total = Header + (Rows * Height) + 2px for top/bottom borders`
        const totalHeight = headerHeight + rowCount * rowHeight + 2

        return `${totalHeight + 1}px`
    }
}
