import { HandlerService } from '@/modules/base/services/handler.service'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import {
    Component,
    computed,
    effect,
    inject,
    OnInit,
    signal,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { combineLatest, finalize, take } from 'rxjs'
import { FormsModule } from '@angular/forms'
import { UkomExamCatComponent } from '../ukom-exam-cat/ukom-exam-cat.component'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { UkomRoomService } from '@/modules/ukom/services/ukom-room.service'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { UkomExamWawancaraComponent } from '@/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-wawancara/ukom-exam-wawancara.component'
import { DurationPipe } from '@/modules/base/pipes/duration.pipe'
import { ExaminerScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-examiner-list.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { UkomExamMakalahComponent } from '@/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-makalah/ukom-exam-makalah.component'
import { ParticipantListModalComponent } from './participant-list-modal/participant-list-modal.component'
import { ExaminerListModalComponent } from './examiner-list-modal/examiner-list-modal.component'
import { ParticipantScheduleList } from '@/modules/ukom/models/exam-schedule/exam-schedule-participant-list.model'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { UkomExamGeneralComponent } from '@/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-general/ukom-exam-general.component'

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
        UkomExamMakalahComponent,
        ParticipantListModalComponent,
        ExaminerListModalComponent,
        UkomExamGeneralComponent,
    ],
    templateUrl: './ukom-exam-choose-comp-questions.component.html',
    styleUrl: './ukom-exam-choose-comp-questions.component.scss',
})
export class UkomExamChooseCompQuestionsComponent implements OnInit {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    ukomRoomService = inject(UkomRoomService)
    ukomExamScheduleService = inject(UkomExamScheduleService)
    roomUkomDetail = new RoomUkomDetail()
    examDetail = signal<ExamSchedule>(null)

    isLoadingRoomDetail = signal(false)
    isLoadingExamDetail = signal(false)
    isLoadingParticipant = signal(false)
    isLoadingExaminer = signal(false)

    isLoading = computed(
        () =>
            this.isLoadingRoomDetail() ||
            this.isLoadingExamDetail() ||
            this.isLoadingParticipant() ||
            this.isLoadingExaminer(),
    )
    examinerList = signal<ExaminerScheduleList[]>([])
    participantList = signal<ParticipantScheduleList[]>([])

    // Modal state
    showParticipantListModal = signal<boolean>(false)
    showExaminerListModal = signal<boolean>(false)

    roomId = signal('')
    examId = signal('')
    childExamId = computed(() => {
        return this.examDetail()?.examScheduleChild?.id ?? null
    })
    typeUkom = computed(() => {
        return this.examDetail()?.examTypeCode
    })
    examScheduleService = inject(UkomExamScheduleService)
    protected readonly ExamTypeCategory = ExamTypeCategory

    constructor(
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService,
        private router: Router,
    ) {
        effect(
            () => {
                const roomId = this.roomId()
                if (!roomId) return
                this.getRoomDetail()
            },
            { allowSignalWrites: true },
        )
        effect(
            () => {
                const examId = this.examId()

                if (!examId) return
                this.getExamDetail()
            },
            { allowSignalWrites: true },
        )
        effect(
            () => {
                const examScheduleId = this.childExamId() ?? this.examId()
                if (!examScheduleId) return
                this.getExaminerListId()
            },
            { allowSignalWrites: true },
        )
        effect(
            () => {
                // For participants: use childExamId if available (for MAKALAH), otherwise use examId
                const participantScheduleId =
                    this.childExamId() ?? this.examId()
                if (!participantScheduleId) return
                this.getParticipantList()
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {
        combineLatest([
            this.activatedRoute.paramMap.pipe(take(1)),
            this.activatedRoute.queryParamMap.pipe(take(1)),
        ]).subscribe(([paramMap, queryParamMap]) => {
            this.roomId.set(paramMap.get('roomid'))
            this.examId.set(paramMap.get('id'))
        })
    }

    getExaminerListId() {
        this.isLoadingExaminer.set(true)
        // const examScheduleId = this.childExamId() ?? this.examId()
        const examScheduleId = this.examId()

        this.ukomExamScheduleService
            .getExaminerListByExamScheduleId(examScheduleId)
            .pipe(
                finalize(() => {
                    this.isLoadingExaminer.set(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.examinerList.set(res)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan daftar penguji',
                    )
                },
            })
    }

    getParticipantList() {
        // For MAKALAH: fetch from child (seminar) schedule
        // For other types: fetch from main schedule
        const participantScheduleId = this.childExamId() ?? this.examId()
        if (!participantScheduleId) return

        this.isLoadingParticipant.set(true)
        this.ukomExamScheduleService
            .getParticipantListByExamScheduleId(participantScheduleId)
            .pipe(
                finalize(() => {
                    this.isLoadingParticipant.set(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.participantList.set(res)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan daftar peserta',
                    )
                },
            })
    }

    openParticipantListModal() {
        this.showParticipantListModal.set(true)
    }

    closeParticipantListModal() {
        this.showParticipantListModal.set(false)
    }

    openExaminerListModal() {
        this.showExaminerListModal.set(true)
    }

    closeExaminerListModal() {
        this.showExaminerListModal.set(false)
    }

    refreshParticipantList() {
        this.getParticipantList()
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

    getRoomDetail() {
        this.isLoadingRoomDetail.set(true)
        this.ukomRoomService
            .getRoomDetailByRoomId(this.roomId())
            .pipe(
                finalize(() => {
                    this.isLoadingRoomDetail.set(false)
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

    getExamDetail() {
        this.isLoadingExamDetail.set(true)
        this.examScheduleService
            .getExamScheduleDetailById(this.examId())
            .pipe(
                finalize(() => {
                    this.isLoadingExamDetail.set(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.examDetail.set(res)
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
