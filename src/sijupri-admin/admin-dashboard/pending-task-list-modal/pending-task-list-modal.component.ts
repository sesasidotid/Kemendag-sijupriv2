import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { AgGridAngular } from 'ag-grid-angular'
import {
    CellClickedEvent,
    ColDef,
    GridApi,
    GridReadyEvent,
    ICellRendererParams,
} from 'ag-grid-community'

@Component({
    selector: 'app-pending-task-list-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, AgGridAngular],
    templateUrl: './pending-task-list-modal.component.html',
    styleUrl: './pending-task-list-modal.component.scss',
})
export class PendingTaskListModalComponent {
    @Input() pendingTaskList: PendingTask[] = []

    @Output() close = new EventEmitter<void>()

    quickFilterText = ''

    columnDefs: ColDef[] = [
        {
            headerName: 'No',
            width: 80,
            cellClass: 'text-center text-muted',
            valueGetter: (params) => params.node!.rowIndex! + 1,
        },
        {
            headerName: 'Jenis Permohonan',
            field: 'flowName',
            flex: 1.4,
            minWidth: 120,
            cellRenderer: (params: ICellRendererParams) => {
                const task = params.data as PendingTask
                const label = task.flowName || '—'

                return label
            },
        },
        {
            headerName: 'NIP',
            field: 'objectGroup',
            width: 180,
            valueGetter: (params) => {
                const task = params.data as PendingTask
                return task.workflowName === 'formasi_task'
                    ? '—'
                    : task.objectGroup || '—'
            },
        },
        {
            headerName: 'Unit Pengaju',
            field: 'objectGroup',
            width: 200,
            valueGetter: (params) => {
                const task = params.data as PendingTask
                return task.workflowName === 'formasi_task'
                    ? task.objectName || '—'
                    : '—'
            },
        },
        {
            headerName: 'Tanggal Pengajuan',
            field: 'dateCreated',
            flex: 1,
            minWidth: 150,
            valueGetter: (params) =>
                (params.data as PendingTask).dateCreated || '—',
        },
        {
            headerName: 'Aksi',
            width: 90,
            sortable: false,
            filter: false,
            resizable: false,
            cellClass: 'action-cell',
            cellRenderer: () => `
    <button class="action-btn" title="Lihat Detail" type="button">
      <span class="mdi mdi-eye-outline"></span>
    </button>
  `,
            onCellClicked: (params) => {
                const task = params.data as PendingTask
                const route = this.getTaskRoute(task)
                this.router.navigate([route])
                this.onClose()
            },
        },
    ]

    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }

    private gridApi!: GridApi

    constructor(private router: Router) {}

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    onQuickFilterChanged(): void {
        this.gridApi.setGridOption('quickFilterText', this.quickFilterText)
    }

    getTaskRoute(task: PendingTask) : string {
        switch (task.workflowName) {
            case 'participant_ukom_task':
                return `/ukom/ukom-task-list/${task.id}`
            case 'ukom_resignation_task':
                return `/ukom/ukom-resignation-list/${task.id}`
            case 'formasi_task':
                return `/formasi/formasi-task-list/${task.id}`
            case 'akp_task':
                return `/akp/akp-task-list/${task.id}`
            case 'rw_kinerja_task':
                return `/pak/pak-task-list/${task.objectGroup}`
            case 'formasi_task':
                return `/formasi/formasi-task-list/${task.id}`
            default:
                return '/akp/akp-task-list'
        }
    }

    onClose(): void {
        this.close.emit()
    }
}
