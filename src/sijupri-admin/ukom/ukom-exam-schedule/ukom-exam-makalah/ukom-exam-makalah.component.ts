import {
    Component,
    computed,
    effect,
    inject,
    input,
    OnInit,
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
    ScheduleSlot,
} from '@/modules/ukom/models/schedule-slot.model'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { AgGridAngular } from 'ag-grid-angular'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { DurationPipe } from '@/modules/base/pipes/duration.pipe'

@Component({
    selector: 'app-ukom-exam-makalah',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        AgGridAngular,
        TanggalWaktuIndoPipe,
        DurationPipe,
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

    route = inject(ActivatedRoute)
    examScheduleService = inject(UkomExamScheduleService)
    examScheduleDetailLoading = signal(false)
    participantListLoading = signal(false)
    handlerService = inject(HandlerService)
    slotService = inject(ScheduleSlotService)

    // Combined loading state for template
    isLoading = computed(() => {
        return this.examScheduleDetailLoading() || this.participantListLoading()
    })

    mainSchedule = signal<MainSchedule | null>(null)
    allSlots = signal<ScheduleSlot[]>([])
    participantList = signal<ParticipantScheduleList[]>([])
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

        // Effect 2: Fetch participant list when seminar schedule becomes available
        effect(
            () => {
                const seminarScheduleDetail = this.seminarScheduleDetail()
                if (seminarScheduleDetail?.id) {
                    this.fetchParticipantList(seminarScheduleDetail.id)
                }
            },
            { allowSignalWrites: true },
        )

        // Effect 3: Transform to main schedule when both data are available
        effect(() => {
            const seminarScheduleDetail = this.seminarScheduleDetail()
            const participantList = this.participantList()
            if (seminarScheduleDetail && participantList.length >= 0) {
                this.transformToMainSchedule(
                    seminarScheduleDetail,
                    participantList,
                )
            }
        },{allowSignalWrites:true})
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

    fetchParticipantList(seminarScheduleId: string) {
        this.participantListLoading.set(true)

        this.examScheduleService
            .getParticipantListByExamScheduleId(seminarScheduleId)
            .pipe(finalize(() => this.participantListLoading.set(false)))
            .subscribe({
                next: (participantList) => {
                    this.participantList.set(participantList)
                },
                error: (error) => {
                    console.error(error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil daftar peserta.',
                    )
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
                // onCellClicked: (params) => {
                //     const slot = params.data as ScheduleSlot
                //     if (!slot.isOccupied) return
                //
                //     const target = params.event.target as HTMLElement
                //     const action = target.getAttribute('data-action')
                //
                //     if (action === 'reschedule') {
                //         this.openRescheduleModal(slot)
                //     } else if (action === 'update-examiner') {
                //         this.openExaminerModal(slot)
                //     }
                // },
            },
        ]
    }
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

        console.log('mainschedule', mainSchedule)

        this.mainSchedule.set(mainSchedule)
        console.log('qq', this.mainSchedule())

        // Generate all slots
        const slots = this.slotService.generateAllSlots(mainSchedule)
        this.allSlots.set(slots)
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
