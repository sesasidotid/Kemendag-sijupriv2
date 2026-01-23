import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import {
    ScheduleSlot,
    ParticipantSchedule,
} from '@/modules/ukom/models/schedule-slot.model'
import { ScheduleSlotService } from '@/modules/ukom/services/schedule-slot.service'
import { AgGridAngular } from 'ag-grid-angular'
import {
    ColDef,
    GridApi,
    GridReadyEvent,
    RowClassParams,
    SelectionChangedEvent,
} from 'ag-grid-community'

@Component({
    selector: 'app-reschedule-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, AgGridAngular],
    templateUrl: './reschedule-modal.component.html',
    styleUrls: ['./reschedule-modal.component.scss'],
})
export class RescheduleModalComponent implements OnInit {
    @Input() participant!: ParticipantSchedule
    @Input() availableSlots: ScheduleSlot[] = []
    @Input() currentSlot: ScheduleSlot | null = null

    @Output() close = new EventEmitter<void>()
    @Output() confirm = new EventEmitter<{
        participant: ParticipantSchedule
        newSlot: ScheduleSlot
    }>()

    selectedSlot: ScheduleSlot | null = null
    private gridApi!: GridApi

    columnDefs: ColDef[] = [
        {
            headerName: 'Slot',
            field: 'slotIndex',
            width: 80,
            valueFormatter: (params) => `#${params.value + 1}`,
        },
        {
            headerName: 'Waktu Mulai',
            field: 'startTime',
            flex: 1,
            valueFormatter: (params) =>
                this.slotService.formatDateTime(params.value),
        },
        {
            headerName: 'Waktu Selesai',
            field: 'endTime',
            flex: 1,
            valueFormatter: (params) =>
                this.slotService.formatTimeSlot(params.value),
        },
    ]

    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }

    constructor(public slotService: ScheduleSlotService) {}

    ngOnInit(): void {
        // Pre-select current slot if exists
        if (this.currentSlot) {
            this.selectedSlot = this.currentSlot
        }
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()

        // Pre-select current slot in grid
        if (this.currentSlot) {
            this.gridApi.forEachNode((node) => {
                if (node.data?.slotIndex === this.currentSlot?.slotIndex) {
                    node.setSelected(true)
                }
            })
        }
    }

    onSelectionChanged(event: SelectionChangedEvent): void {
        const selectedRows = event.api.getSelectedRows()
        this.selectedSlot = selectedRows.length > 0 ? selectedRows[0] : null
    }

    getRowClass(params: RowClassParams): string | undefined {
        const slot = params.data as ScheduleSlot
        if (slot.slotIndex === this.currentSlot?.slotIndex) {
            return 'current-slot'
        }
        return undefined
    }

    onConfirm(): void {
        if (this.selectedSlot) {
            this.confirm.emit({
                participant: this.participant,
                newSlot: this.selectedSlot,
            })
        }
    }

    onClose(): void {
        this.close.emit()
    }
}
