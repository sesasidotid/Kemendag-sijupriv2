import { HandlerService } from '@/modules/base/services/handler.service'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { Component, inject, OnInit, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import {
    BehaviorSubject,
    combineLatest,
    finalize,
    map,
    Observable,
    take,
} from 'rxjs'
import { FormsModule } from '@angular/forms'
import { UkomExamCatComponent } from '../ukom-exam-cat/ukom-exam-cat.component'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { UkomRoomService } from '@/modules/ukom/services/ukom-room.service'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { UkomExamWawancaraComponent } from '@/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-wawancara/ukom-exam-wawancara.component'
import { DurationPipe } from '@/modules/base/pipes/duration.pipe'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { AgGridAngular } from 'ag-grid-angular'

@Component({
    selector: 'app-ukom-exam-choose-comp-questions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        UkomExamCatComponent,
        TanggalWaktuIndoPipe,
        UkomExamWawancaraComponent,
        DurationPipe,
        AgGridAngular,
    ],
    templateUrl: './ukom-exam-choose-comp-questions.component.html',
    styleUrl: './ukom-exam-choose-comp-questions.component.scss',
})
export class UkomExamChooseCompQuestionsComponent implements OnInit {
    ukomRoomService = inject(UkomRoomService)
    ukomExamScheduleService = inject(UkomExamScheduleService)
    roomUkomDetail = new RoomUkomDetail()
    examDetail = new ExamSchedule()

    typeUkom: string
    isLoadingRoomDetail$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingExamDetail$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)

    isLoading$: Observable<boolean>

    examinerList = signal<ExaminerScheduleList[]>([])

    columnDefs: ColDef[] = []
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
    }
    // AG Grid
    private gridApi!: GridApi

    constructor(
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService,
        private router: Router,
    ) {
        this.isLoading$ = combineLatest([
            this.isLoadingRoomDetail$,
            this.isLoadingExamDetail$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        combineLatest([
            this.activatedRoute.paramMap.pipe(take(1)),
            this.activatedRoute.queryParamMap.pipe(take(1)),
        ]).subscribe(([paramMap, queryParamMap]) => {
            const roomId = paramMap.get('roomid')
            const examId = paramMap.get('id')
            const typeUkom = queryParamMap.get('type_ukom')

            this.typeUkom = typeUkom
            this.getRoomDetail(roomId)
            this.getExamDetail(roomId, examId)
            this.getExaminerListId(examId)
        })

        this.initializeColumnDefs()
    }

    getExaminerListId(examScheduleId: string) {
        this.ukomExamScheduleService
            .getExaminerListByExamScheduleId(examScheduleId)
            .subscribe({
                next: (res) => {
                    this.examinerList.set(res)
                },
                error: (err) => {
                    console.error(err)
                },
            })
    }

    back() {
        this.router.navigate(
            [
                `/ukom/ukom-room-list/${this.roomUkomDetail.id}/add-ukom-schedule`,
            ],
            {
                replaceUrl: true,
            },
        )
    }

    getRoomDetail(roomId: string) {
        this.isLoadingRoomDetail$.next(true)
        this.ukomRoomService
            .getRoomDetailByRoomId(roomId)
            .pipe(
                finalize(() => {
                    this.isLoadingRoomDetail$.next(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.roomUkomDetail = res
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan detail ruang UKOM',
                    )
                },
            })
    }

    getExamDetail(roomId: string, examId: string) {
        this.isLoadingExamDetail$.next(true)
        this.ukomExamScheduleService
            .getExamSchedulesRoomID(roomId)
            .pipe(
                finalize(() => {
                    this.isLoadingExamDetail$.next(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.examDetail = res.find((exam) => exam.id === examId)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan detail ujian',
                    )
                },
            })
    }

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api
        this.gridApi.sizeColumnsToFit()
    }

    calculateGridHeight(): string {
        const rowCount = this.examinerList().length
        const headerHeight = 48
        const rowHeight = 42

        // Total = Header + (Rows * Height) + 2px for top/bottom borders
        const totalHeight = headerHeight + rowCount * rowHeight + 2

        return `${totalHeight + 1}px`
    }

    private initializeColumnDefs(): void {
        this.columnDefs = [
            {
                headerName: 'No',
                field: 'index',
                width: 80,
                cellClass: 'text-center',
                valueGetter: (params) => {
                    return params.node.rowIndex + 1
                },
            },
            {
                headerName: 'Username',
                field: 'examinerUkom.nip',
            },
            {
                headerName: 'Nama',
                field: 'examinerUkom.user.name',
                flex: 1,
            },
        ]
    }
}
