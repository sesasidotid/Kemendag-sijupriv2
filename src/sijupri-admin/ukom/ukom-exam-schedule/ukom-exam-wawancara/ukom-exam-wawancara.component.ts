import { Component, effect, inject, input, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { AgGridAngular } from 'ag-grid-angular'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import {
    MainSchedule,
    ParticipantSchedule,
    RescheduleRequest,
    ScheduleSlot,
} from '@/modules/ukom/models/schedule-slot.model'
import { ScheduleSlotService } from '@/modules/ukom/services/schedule-slot.service'
import { RescheduleModalComponent } from './reschedule-modal/reschedule-modal.component'

/**
 * Admin Schedule Viewer with Manual Rescheduling
 *
 * Features:
 * - Slot-based timetable view using AG Grid
 * - Manual reschedule capability with validation
 * - Enforces business rules:
 *   - No overlapping slots
 *   - Must be within main schedule
 *   - No scheduling during 20:00-06:00
 */
@Component({
    selector: 'app-ukom-exam-wawancara',
    standalone: true,
    imports: [CommonModule, AgGridAngular, RescheduleModalComponent],
    templateUrl: './ukom-exam-wawancara.component.html',
    styleUrl: './ukom-exam-wawancara.component.scss',
})
export class UkomExamWawancaraComponent implements OnInit {
    roomUkomDetail = input<RoomUkomDetail>()
    examDetail = input<ExamSchedule>()

    handlerService = inject(HandlerService)
    examScheduleService = inject(UkomExamScheduleService)
    slotService = inject(ScheduleSlotService)

    examScheduleDetail = signal<ExamSchedule | null>(null)
    examScheduleDetailLoading = signal<boolean>(false)

    // Schedule data
    mainSchedule = signal<MainSchedule | null>(null)
    allSlots = signal<ScheduleSlot[]>([])

    // Modal state
    showRescheduleModal = signal<boolean>(false)
    selectedParticipant = signal<ParticipantSchedule | null>(null)
    availableSlotsForReschedule = signal<ScheduleSlot[]>([])
    currentParticipantSlot = signal<ScheduleSlot | null>(null)
    columnDefs: ColDef[] = []
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    // AG Grid
    private gridApi!: GridApi

    constructor() {
        effect(
            () => {
                const exam = this.examDetail()
                if (!exam?.id) return

                this.fetchExamScheduleDetail(exam.id)
            },
            { allowSignalWrites: true },
        )
    }

    /**
     * Get summary statistics
     */
    get scheduleSummary() {
        const slots = this.allSlots()
        const total = slots.length
        const occupied = slots.filter((s) => s.isOccupied).length
        const unavailable = slots.filter((s) => s.isUnavailable).length
        const available = total - occupied - unavailable

        return { total, occupied, unavailable, available }
    }

    ngOnInit(): void {
        this.initializeColumnDefs()
    }

    /**
     * Fetch exam schedule detail and transform to MainSchedule
     */
    fetchExamScheduleDetail(examId: string): void {
        this.examScheduleDetailLoading.set(true)
        this.examScheduleService
            .getExamScheduleDetailById(examId)
            .pipe(finalize(() => this.examScheduleDetailLoading.set(false)))
            .subscribe({
                next: (res) => {
                    this.examScheduleDetail.set(res)
                    this.transformToMainSchedule(res)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil detail jadwal ujian.',
                    )
                },
            })
    }

    /**
     * Handle AG Grid ready event
     */
    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    /**
     * Open reschedule modal for a participant
     */
    openRescheduleModal(slot: ScheduleSlot): void {
        if (!slot.participantSchedule) return

        this.selectedParticipant.set(slot.participantSchedule)
        this.currentParticipantSlot.set(slot)

        // Get available slots (excluding current participant's slot)
        const available = this.slotService.getAvailableSlots(this.allSlots())
        this.availableSlotsForReschedule.set(available)

        this.showRescheduleModal.set(true)
    }

    /**
     * Close reschedule modal
     */
    closeRescheduleModal(): void {
        this.showRescheduleModal.set(false)
        this.selectedParticipant.set(null)
        this.currentParticipantSlot.set(null)
        this.availableSlotsForReschedule.set([])
    }

    /**
     * Confirm reschedule action
     */
    confirmReschedule(event: {
        participant: ParticipantSchedule
        newSlot: ScheduleSlot
    }): void {
        const { participant, newSlot } = event
        const main = this.mainSchedule()

        if (!main) return

        // Validate reschedule
        const validation = this.slotService.validateReschedule(
            newSlot.startTime,
            main,
            participant.participantId,
        )

        if (!validation.valid) {
            this.handlerService.handleAlert(
                'Error',
                validation.reason || 'Invalid reschedule',
            )
            return
        }

        // Prepare reschedule request
        const request: RescheduleRequest = {
            participantScheduleId: participant.id,
            participantId: participant.participantId,
            newPersonalSchedule: newSlot.startTime,
            examScheduleId: participant.examScheduleId,
        }

        // TODO: Call backend API to persist the change
        this.performReschedule(request)
    }

    /**
     * Initialize AG Grid column definitions
     */
    private initializeColumnDefs(): void {
        this.columnDefs = [
            {
                headerName: 'Slot',
                field: 'slotIndex',
                width: 80,
                valueFormatter: (params) => `#${params.value + 1}`,
                cellClass: 'text-center',
            },
            {
                headerName: 'Waktu Mulai',
                field: 'startTime',
                width: 200,
                valueFormatter: (params) =>
                    this.slotService.formatDateTime(params.value),
            },
            {
                headerName: 'Waktu Selesai',
                field: 'endTime',
                width: 140,
                valueFormatter: (params) =>
                    this.slotService.formatTimeSlot(params.value),
            },
            {
                headerName: 'Peserta',
                field: 'participantSchedule.participantName',
                flex: 1,
                valueGetter: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isUnavailable) {
                        return '⛔ Tidak Tersedia (20:00-06:00 WIB)'
                    }
                    return slot.participantSchedule?.participantName || '—'
                },
                cellStyle: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isUnavailable) {
                        return {
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            fontStyle: 'italic',
                        }
                    }
                    if (slot.isOccupied) {
                        return { backgroundColor: '#d1e7dd' }
                    }
                    return { backgroundColor: '#f8f9fa' }
                },
            },
            {
                headerName: 'NIP',
                field: 'participantSchedule.participantNip',
                width: 150,
                valueGetter: (params) => {
                    const slot = params.data as ScheduleSlot
                    return slot.participantSchedule?.participantNip || '—'
                },
            },
            {
                headerName: 'Status',
                width: 120,
                cellClass: 'text-center',
                valueGetter: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isUnavailable) return 'Tidak Tersedia'
                    if (slot.isOccupied) return 'Terisi'
                    return 'Tersedia'
                },
                cellStyle: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isUnavailable) {
                        return { color: '#dc3545', fontWeight: '500' }
                    }
                    if (slot.isOccupied) {
                        return { color: '#198754', fontWeight: '500' }
                    }
                    return { color: '#6c757d' }
                },
            },
            {
                headerName: 'Aksi',
                width: 140,
                cellClass: 'text-center',
                cellRenderer: (params: any) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isUnavailable || !slot.isOccupied) {
                        return '—'
                    }
                    return `<button class="btn btn-sm btn-primary">Atur Ulang</button>`
                },
                onCellClicked: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isOccupied && !slot.isUnavailable) {
                        this.openRescheduleModal(slot)
                    }
                },
            },
        ]
    }

    /**
     * Transform ExamSchedule to MainSchedule and generate slots
     * All dates are parsed as UTC+7 times (no timezone conversion)
     */
    private transformToMainSchedule(examSchedule: ExamSchedule): void {
        const participantSchedules: ParticipantSchedule[] =
            examSchedule.participantScheduleList?.map((p) => ({
                id: p.id,
                participantId: p.participantId,
                examScheduleId: p.examScheduleId,
                personalSchedule: p.personalSchedule
                    ? this.slotService.parseAsUTC7(p.personalSchedule)
                    : null,
                participantName: p.participantUkom?.name || 'Unknown',
                participantNip: p.participantUkom?.nip,
            })) || []

        const mainSchedule: MainSchedule = {
            id: examSchedule.id,
            startTime: this.slotService.parseAsUTC7(examSchedule.startTime),
            endTime: this.slotService.parseAsUTC7(examSchedule.endTime),
            duration: examSchedule.duration,
            participantScheduleList: participantSchedules,
        }

        this.mainSchedule.set(mainSchedule)

        // Generate all slots
        const slots = this.slotService.generateAllSlots(mainSchedule)
        this.allSlots.set(slots)
    }

    /**
     * Perform reschedule (currently mocked)
     */
    private performReschedule(request: RescheduleRequest): void {
        const main = this.mainSchedule()
        if (!main) return

        this.examScheduleService
            .updateParticipantScheduleById(
                request.participantScheduleId,
                request.newPersonalSchedule,
            )
            .subscribe({
                next: () => {
                    // Update in-memory state AFTER API success
                    const participantIndex =
                        main.participantScheduleList.findIndex(
                            (p) => p.id === request.participantScheduleId,
                        )

                    if (participantIndex !== -1) {
                        main.participantScheduleList[
                            participantIndex
                        ].personalSchedule = request.newPersonalSchedule

                        // Regenerate slots
                        const slots = this.slotService.generateAllSlots(main)
                        this.allSlots.set(slots)
                    }

                    this.handlerService.handleAlert(
                        'Success',
                        'Jadwal berhasil diubah',
                    )

                    this.closeRescheduleModal()
                },
                error: (err) => {
                    console.error('Reschedule failed', err)

                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengubah jadwal. Silakan coba lagi.',
                    )
                },
            })
    }
}
