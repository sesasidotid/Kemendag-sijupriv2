import { HandlerService } from '@/modules/base/services/handler.service'
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
import { finalize, forkJoin, map, of, switchMap } from 'rxjs'
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
import { UkomExamPraktikComponent } from '@/sijupri-admin/ukom/ukom-exam-schedule/ukom-exam-praktik/ukom-exam-praktik.component'
import { toSignal } from '@angular/core/rxjs-interop'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { CatService } from '@/modules/ukom/services/cat.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'

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
        UkomExamPraktikComponent,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-exam-choose-comp-questions.component.html',
    styleUrl: './ukom-exam-choose-comp-questions.component.scss',
})
export class UkomExamChooseCompQuestionsComponent implements OnInit {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    ukomRoomService = inject(UkomRoomService)
    ukomExamScheduleService = inject(UkomExamScheduleService)
    // roomUkomDetail = new RoomUkomDetail()
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
    readonly uniqueExaminers = computed(() => {
        const list = this.examinerList()

        const map = new Map<string, ExaminerScheduleList>()

        for (const item of list) {
            const id = item.examinerId
            if (id && !map.has(id)) {
                map.set(id, item)
            }
        }

        return Array.from(map.values())
    })
    participantList = signal<ParticipantScheduleList[]>([])
    roomUkomDetail = signal<RoomUkomDetail>(null)
    showParticipantListModal = signal<boolean>(false)
    showExaminerListModal = signal<boolean>(false)

    childExamId = computed(() => {
        return this.examDetail()?.examScheduleChild?.id ?? null
    })
    typeUkom = computed(() => {
        return this.examDetail()?.examTypeCode
    })
    examScheduleService = inject(UkomExamScheduleService)
    route = inject(ActivatedRoute)
    handlerService = inject(HandlerService)
    router = inject(Router)
    catService = inject(CatService)
    confirmationService = inject(ConfirmationService)
    protected readonly ExamTypeCategory = ExamTypeCategory
    private paramMap = toSignal(this.route.paramMap)
    examId = computed(() => this.paramMap()?.get('id'))
    roomId = computed(() => this.paramMap()?.get('roomid'))

    constructor() {
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
                const detail = this.examDetail()
                const examId = this.examId()

                if (!detail || !examId) return

                this.getExaminerListId()
            },
            { allowSignalWrites: true },
        )
        effect(
            () => {
                const participantScheduleId =
                    this.childExamId() ?? this.examId()
                if (!participantScheduleId) return
                this.getParticipantList()
            },
            { allowSignalWrites: true },
        )

        effect(
            () => {
                const roomId = this.roomId()
                if (!roomId) return

                this.getRoomDetail()
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {}

    getExaminerListId() {
        this.isLoadingExaminer.set(true)

        const examId = this.examId()
        const childExamId = this.childExamId()

        const parent$ =
            this.ukomExamScheduleService.getExaminerListByExamScheduleId(examId)

        const child$ = childExamId
            ? this.ukomExamScheduleService.getExaminerListByExamScheduleId(
                  childExamId,
              )
            : of([])

        forkJoin([parent$, child$])
            .pipe(
                finalize(() => {
                    this.isLoadingExaminer.set(false)
                }),
            )
            .subscribe({
                next: ([parentRes, childRes]) => {
                    const parentMapped = parentRes.map((item) => ({
                        ...item,
                        examType: this.examDetail().examTypeCode,
                    }))

                    const childMapped = childRes.map((item) => ({
                        ...item,
                        examType:
                            this.examDetail().examScheduleChild?.examTypeCode,
                    }))

                    const merged = [...parentMapped, ...childMapped]

                    const unique = merged.filter(
                        (item, index, self) =>
                            index === self.findIndex((i) => i.id === item.id),
                    )

                    this.examinerList.set(unique)
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
            switchMap((participants) => {
                if (!participants.length) {
                    return of([])
                }

                const attendanceRequests = participants.map((participant) =>
                    this.catService.getExamAttendance(
                        this.examId(),
                        participant.participantUkom.id,
                    ),
                )

                return forkJoin(
                    attendanceRequests.map((request, index) =>
                        request.pipe(
                            map((examAttendance) => ({
                                ...participants[index],
                                examAttendance,
                            })),
                        ),
                    ),
                )
            }),
            finalize(() => {
                this.isLoadingParticipant.set(false)
            }),
        )
        .subscribe({
            next: (participants) => {
                this.participantList.set(participants)
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
                    this.roomUkomDetail.set(res)
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendapatkan detail ruangan',
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
        this.router.navigate(['../../add-ukom-schedule'], {
            relativeTo: this.route,
            replaceUrl: true,
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

    deleteExamAttendace() {
        this.confirmationService
            .open(
                false,
                'Hapus Kehadiran Ujian',
                'Apakah Anda yakin ingin menghapus seluruh data kehadiran peserta pada ujian ini? Seluruh peserta akan dianggap belum pernah mengikuti ujian, baik yang sudah maupun belum ujian. Data kehadiran yang dihapus juga mencakup peserta yang sudah memiliki nilai maupun yang belum memiliki nilai.',
            )
            .subscribe({
                next: ({ confirmed }) => {
                    if (!confirmed) return

                    if (this.examId() == null) {
                        return
                    }
                    this.catService
                        .deleteExamAttendance(this.examId())
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Data kehadiran ujian berhasil direset untuk seluruh peserta. ',
                                )
                            },
                            error: (err) => {
                                console.error(err)
                                this.handlerService.handleException(err)
                            },
                        })
                },
            })
    }
}
