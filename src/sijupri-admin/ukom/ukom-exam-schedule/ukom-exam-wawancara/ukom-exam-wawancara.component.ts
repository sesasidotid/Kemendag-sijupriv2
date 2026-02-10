import {
    Component,
    effect,
    inject,
    input,
    OnInit,
    output,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { HandlerService } from '@/modules/base/services/handler.service'
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
import { UpdateExaminerModalComponent } from './update-examiner-modal/update-examiner-modal.component'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { UpdateExaminerForParticipantRequest } from '@/modules/ukom/models/exam-schedule/update-examiner-for-participant-request.model'

/**
 * Admin Schedule Viewer with Manual Rescheduling
 *
 * Features:
 * - Slot-based timetable view using AG Grid
 * - Manual reschedule capability with validation
 * - Enforces business rules:
 *   - No overlapping slots
 *   - Must be within main schedule
 *   - Automatically skips 12:00-13:00 (lunch break) - resumes at 13:00
 *   - Automatically skips 20:00-06:00 (night hours) - resumes at 06:00
 */
@Component({
    selector: 'app-ukom-exam-wawancara',
    standalone: true,
    imports: [
        CommonModule,
        AgGridAngular,
        RescheduleModalComponent,
        UpdateExaminerModalComponent,
    ],
    templateUrl: './ukom-exam-wawancara.component.html',
    styleUrl: './ukom-exam-wawancara.component.scss',
})
export class UkomExamWawancaraComponent implements OnInit {
    participantListRefresh = output()

    roomUkomDetail = input<RoomUkomDetail>()
    examDetail = input<ExamSchedule>()
    examinerList = input.required<ExaminerScheduleList[]>()
    participantList = input<ParticipantScheduleList[]>([])

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

    // Examiner Modal state
    showExaminerModal = signal<boolean>(false)
    selectedParticipantForExaminer = signal<ParticipantSchedule | null>(null)
    currentSlotForExaminer = signal<ScheduleSlot | null>(null)

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
                const participants = this.participantList()
                if (!exam?.id) return

                this.examScheduleDetail.set(exam)
                this.transformToMainSchedule(exam, participants)
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
        const available = total - occupied

        return { total, occupied, unavailable: 0, available }
    }

    ngOnInit(): void {
        this.initializeColumnDefs()
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
                validation.reason || 'Jadwal tidak valid.',
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

        this.performReschedule(request)
    }

    /**
     * Open examiner update modal for a participant
     */
    openExaminerModal(slot: ScheduleSlot): void {
        if (!slot.participantSchedule) return

        this.selectedParticipantForExaminer.set(slot.participantSchedule)
        this.currentSlotForExaminer.set(slot)
        this.showExaminerModal.set(true)
    }

    /**
     * Close examiner update modal
     */
    closeExaminerModal(): void {
        this.showExaminerModal.set(false)
        this.selectedParticipantForExaminer.set(null)
        this.currentSlotForExaminer.set(null)
    }

    /**
     * Confirm examiner update action
     */
    confirmExaminerUpdate(event: {
        participant: ParticipantSchedule
        examinerId: string
    }): void {
        const { participant, examinerId } = event

        // Prepare request
        const request = new UpdateExaminerForParticipantRequest({
            participantScheduleId: participant.id,
            examinerScheduleIdList: [examinerId], // For wawancara, only one examiner
        })

        this.performExaminerUpdate(request)
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
                    return slot.participantSchedule?.participantName || '—'
                },
                cellStyle: (params) => {
                    const slot = params.data as ScheduleSlot
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
                headerName: 'Penguji',
                field: 'participantSchedule.examinerName',
                flex: 1,
                valueGetter: (params) => {
                    const slot = params.data as ScheduleSlot
                    return slot.participantSchedule?.examinerName || '—'
                },
            },
            // {
            //     headerName: 'Status',
            //     width: 120,
            //     cellClass: 'text-center',
            //     valueGetter: (params) => {
            //         const slot = params.data as ScheduleSlot
            //         if (slot.isOccupied) return 'Terisi'
            //         return 'Tersedia'
            //     },
            //     cellStyle: (params) => {
            //         const slot = params.data as ScheduleSlot
            //         if (slot.isOccupied) {
            //             return { color: '#198754', fontWeight: '500' }
            //         }
            //         return { color: '#6c757d' }
            //     },
            // },
            {
                headerName: 'Aksi',
                width: 250,
                cellClass: 'text-center',
                cellRenderer: (params: any) => {
                    const slot = params.data as ScheduleSlot
                    if (!slot.isOccupied) {
                        return '—'
                    }
                    return `
                        <button class="btn btn-sm btn-primary me-2" data-action="reschedule">Atur Ulang</button>
                        <button class="btn btn-sm btn-info" data-action="update-examiner">Ubah Penguji</button>
                    `
                },
                onCellClicked: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (!slot.isOccupied) return

                    const target = params.event.target as HTMLElement
                    const action = target.getAttribute('data-action')

                    if (action === 'reschedule') {
                        this.openRescheduleModal(slot)
                    } else if (action === 'update-examiner') {
                        this.openExaminerModal(slot)
                    }
                },
            },
        ]
    }

    /**
     * Transform ExamSchedule to MainSchedule and generate slots
     * All dates are parsed as UTC+7 times (no timezone conversion)
     */
    private transformToMainSchedule(
        examSchedule: ExamSchedule,
        participantScheduleList: ParticipantScheduleList[],
    ): void {
        const examinerMap = this.buildExaminerMap(this.examinerList())

        const participantSchedules: ParticipantSchedule[] =
            participantScheduleList.map((p) => ({
                id: p.id,
                participantId: p.participantId,
                examScheduleId: p.examScheduleId,
                personalSchedule: p.personalSchedule
                    ? this.slotService.parseAsUTC7(p.personalSchedule)
                    : null,
                participantName: p.participantUkom?.name || 'Unknown',
                participantNip: p.participantUkom?.nip || 'Unknown',
                examinerName:
                    examinerMap.get(
                        p.examScheduleSupervised[0]?.examinerScheduleId,
                    ) ?? 'Unknown',
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
                    // Notify parent to refresh participants
                    this.participantListRefresh.emit()

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

    /**
     * Perform examiner update via API
     */
    private performExaminerUpdate(
        request: UpdateExaminerForParticipantRequest,
    ): void {
        const main = this.mainSchedule()
        if (!main) return

        this.examScheduleService
            .updateExaminerForParticipantScheduleByParticipantScheduleId(
                request,
            )
            .subscribe({
                next: () => {
                    // Notify parent to refresh participants
                    this.participantListRefresh.emit()

                    this.handlerService.handleAlert(
                        'Success',
                        'Penguji berhasil diubah',
                    )

                    this.closeExaminerModal()
                },
                error: (err) => {
                    console.error('Update examiner failed', err)

                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengubah penguji. Silakan coba lagi.',
                    )
                },
            })
    }

    private buildExaminerMap(
        examiners: ExaminerScheduleList[],
    ): Map<string, string> {
        return new Map(
            examiners.map((e) => [
                e.id,
                e.examinerUkom?.user?.name ?? 'Unknown',
            ]),
        )
    }
}
