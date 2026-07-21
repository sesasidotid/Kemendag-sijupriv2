import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ScoreValue } from '@/modules/ukom/models/cat/score-value.type'
import { DataDokumenUkom } from '@/modules/ukom/models/data-dukung'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import {
    CATScore,
} from '@/modules/ukom/models/exam/exam-score.model'
import { UkomGrade } from '@/modules/ukom/models/ukom-grade'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
import { ExamGradeService } from '@/modules/ukom/services/exam-grade.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { UkomGradeService } from '@/modules/ukom/services/ukom-grade.service'
import { CommonModule } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { catchError, finalize, of, switchMap } from 'rxjs'
import { map } from 'rxjs/operators'
import { KabKota } from '@/modules/maintenance/models/kab-kota.model'
import { LandingPageComponent } from '@/modules/landing-page/landing-page.component'
import { UkomGradeDetailTableComponent } from '@/modules/base/components/ukom-grade-detail-table/ukom-grade-detail-table.component'
import { RoomUkom } from '@/modules/ukom/models/cat/room-ukom.model'

@Component({
    selector: 'app-ukom-detail',
    standalone: true,
    imports: [
        CommonModule,
        UkomGradeDetailTableComponent,
        LandingPageComponent,
    ],
    templateUrl: './ukom-detail.component.html',
    styleUrl: './ukom-detail.component.scss',
})
export class UkomDetailComponent {
    id: string

    route = inject(ActivatedRoute)
    participantService = inject(UkomParticipantService)
    examGradeService = inject(ExamGradeService)
    ukomDetail = signal<Participant>(new Participant())
    ukomDetailLoading = signal(false)
    classUkomRoom: RoomUkom
    dataDokumenUkom: DataDokumenUkom[] = []
    dataDokumenUkomLoading = signal(false)
    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true,
    }
    ukomGrade: UkomGrade
    participantScoreLoading = signal(false)
    isLoading = computed(
        () =>
            this.ukomDetailLoading() ||
            this.dataDokumenUkomLoading() ||
            this.participantScoreLoading(),
    )
    allParticipantScoreLoading = signal(false)
    examScoresByScheduleId: Record<string, ScoreValue> = {}
    selectedScheduleId = signal<string>(null)
    selectedExamTypeCode = signal<string>(null)
    isScoreModalOpen = signal(false)
    typeKabKota = signal<string>('')
    kabKotaService = inject(KabKotaService)
    scheduleMap = computed(() => {
        const schedules =
            this.ukomDetail().roomUkomDto?.examScheduleDtoList ?? []

        const map = new Map<string, ExamSchedule>()

        for (const s of schedules) {
            map.set(s.id, s)
        }

        return map
    })
    protected readonly ExamTypeCategory = ExamTypeCategory
    protected readonly CATScore = CATScore

    constructor(
        private handlerService: HandlerService,
        private ukomGradeService: UkomGradeService,
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') ?? ''
        this.getParticipantUkomDetail()
        this.getParticipantScore()
    }

    calculateAge(
        tanggalLahir: string | Date,
        tglSuratUsulan: string | Date,
    ): string {
        if (!tanggalLahir || !tglSuratUsulan) {
            return '-'
        }

        const birthDate = new Date(tanggalLahir)
        const suratDate = new Date(tglSuratUsulan)

        if (isNaN(birthDate.getTime()) || isNaN(suratDate.getTime())) {
            return '-' // Return '-' jika format tanggal salah
        }

        let ageYears = suratDate.getFullYear() - birthDate.getFullYear()
        let ageMonths = suratDate.getMonth() - birthDate.getMonth()
        let ageDays = suratDate.getDate() - birthDate.getDate()

        if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
            ageYears--
            ageMonths += 12
        }

        if (ageDays < 0) {
            const lastMonth = new Date(
                suratDate.getFullYear(),
                suratDate.getMonth(),
                0,
            )
            ageDays += lastMonth.getDate()
            ageMonths--
        }

        return `${ageYears} Tahun ${ageMonths} Bulan ${ageDays} Hari`
    }

    transformInstansiName(value: string): string {
        if (!value) return null

        return value
            .toLowerCase() // Ubah ke lowercase semua dulu
            .replace(/_/g, ' ') // Ganti underscore dengan spasi
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Kapitalisasi setiap kata
    }

    getParticipantUkomDetail() {
        this.ukomDetailLoading.set(true)

        this.participantService
            .getParticipantByParticipantId(this.id)
            .pipe(
                switchMap((participant) =>
                    this.kabKotaService
                        .findById(participant.kabupatenKotaId)
                        .pipe(
                            map((kabupaten) => ({
                                participant,
                                kabupaten,
                            })),
                            catchError(() =>
                                of({
                                    participant,
                                    kabupaten: new KabKota({
                                        type: '',
                                    }),
                                }),
                            ),
                        ),
                ),
                finalize(() => this.ukomDetailLoading.set(false)),
            )
            .subscribe({
                next: ({ participant, kabupaten }) => {
                    this.ukomDetail.set(participant)
                    this.classUkomRoom = new RoomUkom(participant.roomUkomDto)
                    this.typeKabKota.set(kabupaten.type)
                },
                error: () => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat detail',
                    )
                },
            })
    }

    getParticipantScore() {
        this.participantScoreLoading.set(true)

        this.ukomGradeService
            .findGradeParticipantJF(this.id)
            .pipe(finalize(() => this.participantScoreLoading.set(false)))
            .subscribe({
                next: (response) => {
                    this.ukomGrade = new UkomGrade(response)
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat score',
                    )
                },
            })
    }
}
