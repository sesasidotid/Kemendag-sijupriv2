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
import { finalize, forkJoin } from 'rxjs'
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
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

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
    examinerList = input<ExaminerScheduleList[]>([])
    participantList = input<ParticipantScheduleList[]>([])
    examinerListSeminar = computed(() =>
        this.examinerList().filter(
            (item) => item.examType === ExamTypeCategory.SEMINAR,
        ),
    )

    examinerListMakalah = computed(() =>
        this.examinerList().filter(
            (item) => item.examType === ExamTypeCategory.MAKALAH,
        ),
    )
    examId = signal('')
    examScheduleDetail = signal<ExamSchedule>(null)
    seminarScheduleDetail = computed(() => {
        return this.examScheduleDetail()?.examScheduleChild
    })

    makalahParticipantList = signal<ParticipantScheduleList[]>([])

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

        // Effect 2: Fetch makalah participant list (for Komponen A examiners) when examId changes
        effect(
            () => {
                const examId = this.examId()
                if (examId) {
                    this.fetchMakalahParticipantList()
                }
            },
            { allowSignalWrites: true },
        )

        // Effect 3: Transform to main schedule when seminar schedule, both participant lists, and examiners are available
        effect(
            () => {
                const seminarScheduleDetail = this.seminarScheduleDetail()
                const participantList = this.participantList()
                const makalahParticipantList = this.makalahParticipantList()
                const examinerList = this.examinerList()

                const hasExaminerReference =
                    participantList.some(
                        (participant) =>
                            !!this.resolveExaminerScheduleId(participant),
                    ) ||
                    makalahParticipantList.some(
                        (participant) =>
                            !!this.resolveExaminerScheduleId(participant),
                    )

                if (hasExaminerReference && examinerList.length === 0) {
                    return
                }

                if (seminarScheduleDetail && participantList.length >= 0) {
                    this.transformToMainSchedule(
                        seminarScheduleDetail,
                        participantList,
                        makalahParticipantList,
                        examinerList,
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
     * Sends separate API calls for Komponen A (makalah) and Komponen B&C (seminar)
     */
    confirmExaminerUpdate(event: {
        participant: ParticipantSchedule
        examinerIdKomponenA: string
        examinerIdKomponenBC: string
        makalahParticipantScheduleId: string
        seminarParticipantScheduleId: string
    }): void {
        const {
            examinerIdKomponenA,
            examinerIdKomponenBC,
            makalahParticipantScheduleId,
            seminarParticipantScheduleId,
        } = event

        // Update Komponen A (makalah schedule)
        const requestKomponenA = new UpdateExaminerForParticipantRequest({
            participantScheduleId: makalahParticipantScheduleId,
            examinerScheduleIdList: [examinerIdKomponenA],
        })

        // Update Komponen B&C (seminar schedule)
        const requestKomponenBC = new UpdateExaminerForParticipantRequest({
            participantScheduleId: seminarParticipantScheduleId,
            examinerScheduleIdList: [examinerIdKomponenBC],
        })

        this.performExaminerUpdate(requestKomponenA, requestKomponenBC)
    }

    /**
     * Fetch makalah participant list to get examScheduleSupervised for Komponen A
     */
    fetchMakalahParticipantList(): void {
        this.examScheduleService
            .getParticipantListByExamScheduleId(this.examId())
            .subscribe({
                next: (res) => {
                    this.makalahParticipantList.set(res)
                },
                error: (err) => {
                    console.error('Error fetching makalah participants:', err)
                },
            })
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
                    // this.slotService.formatTimeSlot(params.value),
                    this.slotService.formatDateTime(params.value),
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

                    const kompA =
                        slot.participantSchedule.examinerKomponenA || '—'
                    const kompBC =
                        slot.participantSchedule.examinerKomponenBC || '—'

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
        seminarParticipantList: ParticipantScheduleList[],
        makalahParticipantList: ParticipantScheduleList[],
        examinerList: ExaminerScheduleList[],
    ): void {
        // Both Komponen A and B&C use the same examiner pool
        const examinerMap = this.buildExaminerMap(examinerList)
        console.log('examinerMap', examinerMap)

        // Build lookup: participantId -> makalah participant schedule data
        const makalahByParticipantId = new Map<
            string,
            ParticipantScheduleList
        >()
        makalahParticipantList.forEach((p) => {
            makalahByParticipantId.set(p.participantId, p)
        })
        console.log('makalahByParticipantId', makalahByParticipantId)
        console.log('seminarParticipantList', seminarParticipantList)

        // Use seminar participant list as the base (since it has personalSchedule for slots)
        const participantSchedules: ParticipantSchedule[] =
            seminarParticipantList.map((seminarP) => {
                // Komponen A: from makalah participant's examScheduleSupervised
                const makalahP = makalahByParticipantId.get(
                    seminarP.participantId,
                )
                const examinerIdKomponenA =
                    this.resolveExaminerScheduleId(makalahP)
                const examinerKomponenA = examinerIdKomponenA
                    ? (examinerMap.get(examinerIdKomponenA) ?? 'Unknown')
                    : 'Belum ada'

                // Komponen B&C: from seminar participant's examScheduleSupervised
                const examinerIdKomponenBC =
                    this.resolveExaminerScheduleId(seminarP)
                const examinerKomponenBC = examinerIdKomponenBC
                    ? (examinerMap.get(examinerIdKomponenBC) ?? 'Unknown')
                    : 'Belum ada'

                return {
                    id: seminarP.id,
                    participantId: seminarP.participantId,
                    examScheduleId: seminarP.examScheduleId,
                    personalSchedule: seminarP.personalSchedule
                        ? this.slotService.parseAsUTC7(
                              seminarP.personalSchedule,
                          )
                        : null,
                    participantName:
                        seminarP.participantUkom?.name || 'Unknown',
                    participantNip: seminarP.participantUkom?.nip || 'Unknown',
                    examinerName: examinerKomponenA, // For backward compatibility
                    examinerKomponenA: examinerKomponenA,
                    examinerKomponenBC: examinerKomponenBC,
                    // IDs for separate update
                    makalahParticipantScheduleId: makalahP?.id ?? null,
                    seminarParticipantScheduleId: seminarP.id,
                    examinerIdKomponenA: examinerIdKomponenA,
                    examinerIdKomponenBC: examinerIdKomponenBC,
                }
            }) || []
        console.log('participantSchedules', participantSchedules)

        const mainSchedule: MainSchedule = {
            id: examSchedule.id,
            startTime: this.slotService.parseAsUTC7(examSchedule.startTime),
            endTime: this.slotService.parseAsUTC7(examSchedule.endTime),
            duration: examSchedule.duration,
            participantScheduleList: participantSchedules,
        }
        console.log(mainSchedule)

        this.mainSchedule.set(mainSchedule)

        // Generate all slots
        // const slots = this.slotService.generateAllSlots(mainSchedule)
        // this.allSlots.set(slots)
        this.slotService.generateAllSlots(mainSchedule).subscribe((slots) => {
            this.allSlots.set(slots)
        })
    }

    private resolveExaminerScheduleId(
        participant: ParticipantScheduleList | undefined,
    ): string | null {
        if (!participant) return null

        const supervised = participant.examScheduleSupervised as unknown

        if (Array.isArray(supervised)) {
            return supervised[0]?.examinerScheduleId ?? null
        }

        if (
            supervised &&
            typeof supervised === 'object' &&
            'examinerScheduleId' in supervised
        ) {
            return (
                (supervised as { examinerScheduleId?: string })
                    .examinerScheduleId ?? null
            )
        }

        return null
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
                    this.handlerService.handleException(err)
                },
            })
    }

    /**
     * Perform examiner update via API - sends two separate calls for Komponen A and B&C
     */
    private performExaminerUpdate(
        requestKomponenA: UpdateExaminerForParticipantRequest,
        requestKomponenBC: UpdateExaminerForParticipantRequest,
    ): void {
        forkJoin([
            this.examScheduleService.updateExaminerForParticipantScheduleByParticipantScheduleId(
                requestKomponenA,
            ),
            this.examScheduleService.updateExaminerForParticipantScheduleByParticipantScheduleId(
                requestKomponenBC,
            ),
        ]).subscribe({
            next: () => {
                this.handlerService.handleAlert(
                    'Success',
                    'Penguji berhasil diubah.',
                )

                // Refresh makalah participant list (for Komponen A examiners)
                this.fetchMakalahParticipantList()

                // Notify parent to refresh participants (including seminar data)
                this.participantListRefresh.emit()

                this.closeExaminerModal()
            },
            error: (err) => {
                console.error('Update examiner error:', err)
                this.handlerService.handleException(err)
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
