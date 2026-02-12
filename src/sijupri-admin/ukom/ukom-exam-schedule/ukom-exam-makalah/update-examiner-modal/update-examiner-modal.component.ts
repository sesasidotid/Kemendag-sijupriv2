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
    @Input() examinerList: ExaminerScheduleList[] = [] // Seminar examiners (Komponen B&C)
    @Input() examinerListKomponenA: ExaminerScheduleList[] = [] // Makalah examiners (Komponen A)
    @Input() currentSlot: ScheduleSlot | null = null

    @Output() close = new EventEmitter<void>()
    @Output() confirm = new EventEmitter<{
        participant: ParticipantSchedule
        examinerIdKomponenA: string // Examiner schedule ID for Komponen A (makalah)
        examinerIdKomponenBC: string // Examiner schedule ID for Komponen B&C (seminar)
        makalahParticipantScheduleId: string // Participant schedule ID on makalah
        seminarParticipantScheduleId: string // Participant schedule ID on seminar
    }>()

    // Selected examiner IDs for each component
    selectedExaminerKomponenA: string | null = null
    selectedExaminerKomponenBC: string | null = null

    // Current examiner IDs for each component
    currentExaminerIdKomponenA: string | null = null
    currentExaminerIdKomponenBC: string | null = null

    columnDefsKomponenA: ColDef[] = []
    columnDefsKomponenBC: ColDef[] = []
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    private gridApiKomponenA!: GridApi
    private gridApiKomponenBC!: GridApi

    get isValidSelection(): boolean {
        return (
            this.selectedExaminerKomponenA !== null &&
            this.selectedExaminerKomponenBC !== null
        )
    }

    ngOnInit(): void {
        // Use stored examiner IDs directly from the participant
        this.currentExaminerIdKomponenA =
            this.participant.examinerIdKomponenA ?? null
        this.selectedExaminerKomponenA = this.currentExaminerIdKomponenA

        this.currentExaminerIdKomponenBC =
            this.participant.examinerIdKomponenBC ?? null
        this.selectedExaminerKomponenBC = this.currentExaminerIdKomponenBC

        this.initializeColumnDefs()
    }

    onConfirm(): void {
        if (this.selectedExaminerKomponenA && this.selectedExaminerKomponenBC) {
            this.confirm.emit({
                participant: this.participant,
                examinerIdKomponenA: this.selectedExaminerKomponenA,
                examinerIdKomponenBC: this.selectedExaminerKomponenBC,
                makalahParticipantScheduleId:
                    this.participant.makalahParticipantScheduleId,
                seminarParticipantScheduleId:
                    this.participant.seminarParticipantScheduleId,
            })
        }
    }

    onClose(): void {
        this.close.emit()
    }

    onGridReadyKomponenA(params: GridReadyEvent): void {
        this.gridApiKomponenA = params.api
        this.gridApiKomponenA.sizeColumnsToFit()

        // Pre-select current examiner in grid
        if (this.currentExaminerIdKomponenA) {
            this.gridApiKomponenA.forEachNode((node) => {
                if (node.data?.id === this.currentExaminerIdKomponenA) {
                    node.setSelected(true)
                }
            })
        }
    }

    onGridReadyKomponenBC(params: GridReadyEvent): void {
        this.gridApiKomponenBC = params.api
        this.gridApiKomponenBC.sizeColumnsToFit()

        // Pre-select current examiner in grid
        if (this.currentExaminerIdKomponenBC) {
            this.gridApiKomponenBC.forEachNode((node) => {
                if (node.data?.id === this.currentExaminerIdKomponenBC) {
                    node.setSelected(true)
                }
            })
        }
    }

    onSelectionChangedKomponenA(event: SelectionChangedEvent): void {
        const selectedRows = event.api.getSelectedRows()
        this.selectedExaminerKomponenA =
            selectedRows.length > 0 ? selectedRows[0].id : null
    }

    onSelectionChangedKomponenBC(event: SelectionChangedEvent): void {
        const selectedRows = event.api.getSelectedRows()
        this.selectedExaminerKomponenBC =
            selectedRows.length > 0 ? selectedRows[0].id : null
    }

    getRowClassKomponenA(params: RowClassParams): string | undefined {
        const examiner = params.data as ExaminerScheduleList
        if (examiner.id === this.currentExaminerIdKomponenA) {
            return 'current-examiner'
        }
        return undefined
    }

    getRowClassKomponenBC(params: RowClassParams): string | undefined {
        const examiner = params.data as ExaminerScheduleList
        if (examiner.id === this.currentExaminerIdKomponenBC) {
            return 'current-examiner'
        }
        return undefined
    }

    calculateGridHeight(): string {
        const rowCount = this.examinerList.length
        const headerHeight = 48
        const rowHeight = 42
        const totalHeight = headerHeight + rowCount * rowHeight + 2
        return `${totalHeight + 1}px`
    }

    calculateGridHeightKomponenA(): string {
        const rowCount = this.examinerListKomponenA.length
        const headerHeight = 48
        const rowHeight = 42
        const totalHeight = headerHeight + rowCount * rowHeight + 2
        return `${totalHeight + 1}px`
    }

    private initializeColumnDefs(): void {
        // Column definitions for Komponen A
        this.columnDefsKomponenA = [
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
                    return this.currentExaminerIdKomponenA === examiner.id
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

        // Column definitions for Komponen B & C
        this.columnDefsKomponenBC = [
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
                    return this.currentExaminerIdKomponenBC === examiner.id
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
    }
}
