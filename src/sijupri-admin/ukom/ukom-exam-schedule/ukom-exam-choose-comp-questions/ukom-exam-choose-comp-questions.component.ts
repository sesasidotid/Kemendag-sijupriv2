import { HandlerService } from './../../../../modules/base/services/handler.service'
import { RoomUkomDetail } from './../../../../modules/ukom/models/room-ukom-detail'
import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamDetail } from '../../../../modules/ukom/models/exam_detail'
import { CommonModule } from '@angular/common'
import {
    BehaviorSubject,
    combineLatest,
    map,
    take,
    Observable,
    finalize,
    tap,
} from 'rxjs'
import { FormsModule } from '@angular/forms'
import { UkomExamCatComponent } from '../ukom-exam-cat/ukom-exam-cat.component'
import { UkomExamMakalahComponent } from '../ukom-exam-makalah/ukom-exam-makalah.component'
import { TanggalWaktuIndoPipe } from '../../../../modules/base/pipes/tangga-waktu.pipe'
import { UkomRoomService } from '@/modules/ukom/services/ukom-room.service'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
@Component({
    selector: 'app-ukom-exam-choose-comp-questions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        UkomExamCatComponent,
        UkomExamMakalahComponent,
        TanggalWaktuIndoPipe,
    ],
    templateUrl: './ukom-exam-choose-comp-questions.component.html',
    styleUrl: './ukom-exam-choose-comp-questions.component.scss',
})
export class UkomExamChooseCompQuestionsComponent {
    ukomRoomService = inject(UkomRoomService)
    ukomExamScheduleService = inject(UkomExamScheduleService)
    roomUkomDetail = new RoomUkomDetail()
    examDetail = new ExamDetail()

    typeUkom: string
    isLoadingRoomDetail$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingExamDetail$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)

    isLoading$: Observable<boolean>

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
                    if (Array.isArray(res)) {
                        this.examDetail = res.find(
                            (exam: ExamDetail) => exam.id === examId,
                        )
                    } else if (res instanceof ExamDetail) {
                        this.examDetail = res
                    } else {
                        this.examDetail = null
                    }
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
}
