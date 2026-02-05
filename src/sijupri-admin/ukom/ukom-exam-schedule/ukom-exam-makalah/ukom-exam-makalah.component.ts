import {
    Component,
    computed,
    effect,
    inject,
    input,
    OnInit,
    output,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { finalize } from 'rxjs'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ScheduleSlotService } from '@/modules/ukom/services/schedule-slot.service'
import {
    MainSchedule,
    ParticipantSchedule,
    RescheduleRequest,
    ScheduleSlot,
} from '@/modules/ukom/models/schedule-slot.model'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { DurationPipe } from '@/modules/base/pipes/duration.pipe'
import { RescheduleModalComponent } from './reschedule-modal/reschedule-modal.component'
import { UpdateExaminerModalComponent } from './update-examiner-modal/update-examiner-modal.component'
import { UpdateExaminerForParticipantRequest } from '@/modules/ukom/models/exam-schedule/update-examiner-for-participant-request.model'

@Component({
    selector: 'app-ukom-exam-makalah',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        AgGridAngular,
        TanggalWaktuIndoPipe,
        DurationPipe,
        RescheduleModalComponent,
        UpdateExaminerModalComponent,
    ],
    templateUrl: './ukom-exam-makalah.component.html',
    styleUrl: './ukom-exam-makalah.component.scss',
})
export class UkomExamMakalahComponent implements OnInit {
    examId = signal('')
    examScheduleDetail = signal<ExamSchedule>(null)
    seminarScheduleDetail = computed(() => {
        return this.examScheduleDetail()?.examScheduleChild
    })

    examinerList = input<ExaminerScheduleList[]>([])
    participantList = input<ParticipantScheduleList[]>([])

    participantListRefresh = output()

    route = inject(ActivatedRoute)
    examScheduleService = inject(UkomExamScheduleService)
    examScheduleDetailLoading = signal(false)
    handlerService = inject(HandlerService)
    slotService = inject(ScheduleSlotService)

    // Combined loading state for template
    isLoading = computed(() => {
        return this.examScheduleDetailLoading()
    })

    mainSchedule = signal<MainSchedule | null>(null)
    allSlots = signal<ScheduleSlot[]>([])

    // Modal state for reschedule
    showRescheduleModal = signal<boolean>(false)
    selectedParticipant = signal<ParticipantSchedule | null>(null)
    availableSlotsForReschedule = signal<ScheduleSlot[]>([])
    currentParticipantSlot = signal<ScheduleSlot | null>(null)

    // Modal state for update examiner
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
        // Effect 1: Fetch exam schedule detail when examId changes
        effect(
            () => {
                const examId = this.examId()
                if (examId) {
                    this.fetchExamScheduleDetail()
                }
            },
            { allowSignalWrites: true },
        )

        // Effect 2: Transform to main schedule when seminar schedule and participants are available
        effect(
            () => {
                const seminarScheduleDetail = this.seminarScheduleDetail()
                const participantList = this.participantList()
                if (seminarScheduleDetail && participantList.length >= 0) {
                    this.transformToMainSchedule(
                        seminarScheduleDetail,
                        participantList,
                    )
                }
            },
            { allowSignalWrites: true },
        )
    }

    get scheduleSummary() {
        const slots = this.allSlots()
        const total = slots.length
        const occupied = slots.filter((s) => s.isOccupied).length
        const available = total - occupied

        return { total, occupied, unavailable: 0, available }
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const examId = params.get('id')
            if (examId) {
                this.examId.set(examId)
            }
        })

        this.initializeColumnDefs()
    }

    fetchExamScheduleDetail() {
        this.examScheduleDetailLoading.set(true)

        this.examScheduleService
            .getExamScheduleDetailById(this.examId())
            .pipe(finalize(() => this.examScheduleDetailLoading.set(false)))
            .subscribe({
                next: (schedule) => {
                    this.examScheduleDetail.set(schedule)
                },
                error: (error) => {
                    console.error(error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil detail jadwal ujian.',
                    )
                },
            })
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
        examinerIds: string[]
    }): void {
        const { participant, examinerIds } = event

        // Prepare request
        const request = new UpdateExaminerForParticipantRequest({
            participantScheduleId: participant.id,
            examinerScheduleIdList: examinerIds,
        })

        this.performExaminerUpdate(request)
    }

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
                cellRenderer: (params: any) => {
                    const slot = params.data as ScheduleSlot
                    if (!slot.participantSchedule) return '—'

                    const kompA = slot.participantSchedule.examinerKomponenA || '—'
                    const kompBC = slot.participantSchedule.examinerKomponenBC || '—'

                    return `
                        <div style="line-height: 1.4;">
                            <div style="font-size: 0.85em; color: #6c757d;">
                                <strong>Komponen A:</strong> ${kompA}
                            </div>
                            <div style="font-size: 0.85em; color: #6c757d; margin-top: 2px;">
                                <strong>Komponen B & C:</strong> ${kompBC}
                            </div>
                        </div>
                    `
                },
                autoHeight: true,
            },
            {
                headerName: 'Status',
                width: 120,
                cellClass: 'text-center',
                valueGetter: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isOccupied) return 'Terisi'
                    return 'Tersedia'
                },
                cellStyle: (params) => {
                    const slot = params.data as ScheduleSlot
                    if (slot.isOccupied) {
                        return { color: '#198754', fontWeight: '500' }
                    }
                    return { color: '#6c757d' }
                },
            },
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

    private transformToMainSchedule(
        examSchedule: ExamSchedule,
        participantScheduleList: ParticipantScheduleList[],
    ): void {
        const examinerMap = this.buildExaminerMap(this.examinerList())

        const participantSchedules: ParticipantSchedule[] =
            participantScheduleList.map((p) => {
                // Get examiners by index
                const examinerKomponenA =
                    p.examScheduleSupervised && p.examScheduleSupervised[0]
                        ? examinerMap.get(
                              p.examScheduleSupervised[0].examinerScheduleId,
                          ) ?? 'Unknown'
                        : 'Unknown'

                const examinerKomponenBC =
                    p.examScheduleSupervised && p.examScheduleSupervised[1]
                        ? examinerMap.get(
                              p.examScheduleSupervised[1].examinerScheduleId,
                          ) ?? 'Unknown'
                        : undefined

                return {
                    id: p.id,
                    participantId: p.participantId,
                    examScheduleId: p.examScheduleId,
                    personalSchedule: p.personalSchedule
                        ? this.slotService.parseAsUTC7(p.personalSchedule)
                        : null,
                    participantName: p.participantUkom?.name || 'Unknown',
                    participantNip: p.participantUkom?.nip || 'Unknown',
                    examinerName: examinerKomponenA, // For backward compatibility
                    examinerKomponenA: examinerKomponenA,
                    examinerKomponenBC: examinerKomponenBC,
                }
            }) || []

        const mainSchedule: MainSchedule = {
            id: examSchedule.id,
            startTime: this.slotService.parseAsUTC7(examSchedule.startTime),
            endTime: this.slotService.parseAsUTC7(examSchedule.endTime),
            duration: examSchedule.duration,
            participantScheduleList: participantSchedules,
        }

        console.log('mainschedule', mainSchedule)

        this.mainSchedule.set(mainSchedule)
        console.log('qq', this.mainSchedule())

        // Generate all slots
        const slots = this.slotService.generateAllSlots(mainSchedule)
        this.allSlots.set(slots)
    }

    /**
     * Perform reschedule via API
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
                    this.handlerService.handleAlert(
                        'Success',
                        'Jadwal peserta berhasil diubah.',
                    )

                    // Notify parent to refresh participants
                    this.participantListRefresh.emit()

                    this.closeRescheduleModal()
                },
                error: (err) => {
                    console.error('Reschedule error:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengubah jadwal peserta.',
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
        this.examScheduleService
            .updateExaminerForParticipantScheduleByParticipantScheduleId(
                request,
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Penguji berhasil diubah.',
                    )

                    // Notify parent to refresh participants
                    this.participantListRefresh.emit()

                    this.closeExaminerModal()
                },
                error: (err) => {
                    console.error('Update examiner error:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengubah penguji.',
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
