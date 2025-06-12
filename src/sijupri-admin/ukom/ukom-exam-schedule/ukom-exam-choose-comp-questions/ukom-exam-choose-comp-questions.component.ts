import { HandlerService } from './../../../../modules/base/services/handler.service'
import { RoomUkomDetail } from './../../../../modules/ukom/models/room-ukom-detail'
import { Component } from '@angular/core'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ActivatedRoute } from '@angular/router'
import { ExamDetail } from '../../../../modules/ukom/models/exam_detail'
import { CommonModule, Location } from '@angular/common'
import {
    BehaviorSubject,
    combineLatest,
    map,
    take,
    Observable,
    finalize
} from 'rxjs'
import { FormsModule } from '@angular/forms'
import { UkomExamCatComponent } from '../ukom-exam-cat/ukom-exam-cat.component'
import { UkomExamMakalahComponent } from '../ukom-exam-makalah/ukom-exam-makalah.component'
@Component({
    selector: 'app-ukom-exam-choose-comp-questions',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        UkomExamCatComponent,
        UkomExamMakalahComponent
    ],
    templateUrl: './ukom-exam-choose-comp-questions.component.html',
    styleUrl: './ukom-exam-choose-comp-questions.component.scss'
})
export class UkomExamChooseCompQuestionsComponent {
    roomUkomDetail: RoomUkomDetail = new RoomUkomDetail()
    examDetail: ExamDetail = new ExamDetail()
    room_ukom_id: string
    type_ukom: string

    isLoadingRoomDetail$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)

    isLoadingExamDetail$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)

    isLoading$: Observable<boolean>

    constructor (
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService,
        private location: Location
    ) {
        this.isLoading$ = combineLatest([
            this.isLoadingRoomDetail$,
            this.isLoadingExamDetail$
        ]).pipe(map(loadings => loadings.some(isLoading => isLoading)))
    }

    ngOnInit () {
        combineLatest([
            this.activatedRoute.paramMap.pipe(take(1)),
            this.activatedRoute.queryParamMap.pipe(take(1))
        ]).subscribe(([paramMap, queryParamMap]) => {
            this.room_ukom_id = paramMap.get('roomid')
            this.type_ukom = queryParamMap.get('type_ukom')
        })

        this.getRoomDetail()
        this.getExamDetail()
    }

    back () {
        this.location.back()
    }

    getRoomDetail () {
        this.isLoadingRoomDetail$.next(true)
        this.apiService
            .getData(`/api/v1/room_ukom/${this.room_ukom_id}`)
            .pipe(
                finalize(() => {
                    this.isLoadingRoomDetail$.next(false)
                })
            )
            .subscribe({
                next: (res: RoomUkomDetail) => {
                    this.roomUkomDetail = res
                },
                error: (err: any) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan detail ruang UKOM'
                    )
                }
            })
    }
    getExamDetail () {
        this.isLoadingExamDetail$.next(true)
        this.apiService
            .getData(`/api/v1/exam_schedule/room/${this.room_ukom_id}`)
            .pipe(
                finalize(() => {
                    this.isLoadingExamDetail$.next(false)
                })
            )
            .subscribe({
                next: (res: ExamDetail) => {
                    if (Array.isArray(res)) {
                        this.examDetail = res.find(
                            (exam: ExamDetail) =>
                                exam.examTypeCode === this.type_ukom
                        )
                    } else {
                        this.examDetail = null
                    }
                },
                error: (err: any) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan detail ujian'
                    )
                }
            })
    }
}
