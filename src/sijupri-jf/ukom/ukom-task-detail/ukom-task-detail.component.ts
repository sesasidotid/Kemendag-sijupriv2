import { ActivatedRoute, Router } from '@angular/router'
import { ApiService } from '@/modules/base/services/api.service'
import {
    Component,
    computed,
    effect,
    inject,
    OnInit,
    signal,
} from '@angular/core'
import { catchError, finalize, forkJoin, of, switchMap, tap } from 'rxjs'
import { CommonModule, TitleCasePipe } from '@angular/common'
import { DataDokumenUkom } from '@/modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { HandlerService } from '@/modules/base/services/handler.service'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
import { UkomGradeService } from '@/modules/ukom/services/ukom-grade.service'
import { UkomGrade } from '@/modules/ukom/models/ukom-grade'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
import { UkomGradeTableComponent } from '@/modules/base/components/ukom-grade-table/ukom-grade-table.component'
import { ExamGradeService } from '@/modules/ukom/services/exam-grade.service'
import { map } from 'rxjs/operators'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import {
    CATScore,
    MakalahScore,
} from '@/modules/ukom/models/exam/exam-score.model'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { CatScoreComponent } from '@/modules/ukom/components/cat-score/cat-score.component'
import { GenericScoreComponent } from '@/modules/ukom/components/generic-score/generic-score.component'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { ScoreValue } from '@/modules/ukom/models/cat/score-value.type'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { KabKota } from '@/modules/maintenance/models/kab-kota.model'

@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        TanggalIndoPipe,
        TitleCasePipe,
        UkomGradeTableComponent,
        CatScoreComponent,
        GenericScoreComponent,
        ModalComponent,
        TanggalWaktuIndoPipe,
    ],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss',
})
export class UkomTaskDetailComponent implements OnInit {
    id: string

    jenisUkomService = inject(JenisUkomService)
    route = inject(ActivatedRoute)
    participantService = inject(UkomParticipantService)
    documentService = inject(UkomDocumentService)
    examGradeService = inject(ExamGradeService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    ukomDetail = signal<Participant>(new Participant())
    ukomDetailLoading = signal(false)
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
    typeKabKota = signal<string>("")
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
        private apiService: ApiService,
        private router: Router,
        private handlerService: HandlerService,
        private ukomGradeService: UkomGradeService,
    ) {
        effect(
            () => {
                const ukomDetail = this.ukomDetail()
                if (ukomDetail) {
                    this.getAllParticipantScore()
                }
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id') ?? ''
        this.getParticipantUkomDetail()
        this.getDokumenUkomList()
        this.getParticipantScore()
    }

    downloadRekomendasi(): void {
        const url = this.ukomDetail().rekomendasiUrl

        if (!url) {
            this.handlerService.handleAlert(
                'Warning',
                'URL rekomendasi tidak tersedia',
            )
            return
        }

        console.log('Downloading rekomendasi from:', url)

        try {
            const parsedUrl = new URL(url)
            const relativePath = parsedUrl.pathname + parsedUrl.search
            const filename = this.ukomDetail().rekomendasi || 'rekomendasi.pdf'

            this.apiService.getDownload(relativePath, filename).subscribe({
                next: () => {},
                error: (err) => {
                    console.error('Download failed:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengunduh rekomendasi',
                    )
                },
            })
        } catch (error) {
            console.error('Invalid URL:', error)
            this.handlerService.handleAlert(
                'Error',
                'URL rekomendasi tidak valid',
            )
        }
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

    mapDokumenUkom() {
        this.fileHandlerData.files = {}

        this.dataDokumenUkom.forEach((doc, index) => {
            this.fileHandlerData.files[`file${index}`] = {
                label: doc.dokumenPersyaratanName,
                source: doc.dokumenUrl,
                id: doc.id,
                required: false,
            }
        })
    }

    getDokumenUkomList() {
        this.dataDokumenUkomLoading.set(true)
        this.documentService
            .getDocumentParticipantByTaskID(this.id)
            .pipe(finalize(() => this.dataDokumenUkomLoading.set(false)))
            .subscribe({
                next: (response: DataDokumenUkom[]) => {
                    this.dataDokumenUkom = response || []
                    this.mapDokumenUkom()
                },
                error: (error) => {
                    console.error('Failed to fetch dokumen ukom:', error)
                    this.dataDokumenUkom = []
                    this.mapDokumenUkom()
                },
            })
    }

    backToList() {
        this.router.navigate(['/ukom/ukom-list'])
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

    hasAnyScores(): boolean {
        return Object.values(this.examScoresByScheduleId).some(
            (score) => score != null,
        )
    }

    toggleScoreModal(scheduleId?: string, examTypeCode?: string) {
        if (scheduleId && examTypeCode) {
            this.selectedScheduleId.set(scheduleId)
            this.selectedExamTypeCode.set(examTypeCode)
        }
        this.isScoreModalOpen.update((v) => !v)
        if (!this.isScoreModalOpen()) {
            this.selectedScheduleId.set(null)
            this.selectedExamTypeCode.set(null)
        }
    }

    getParticipantScore() {
        this.participantScoreLoading.set(true)

        this.ukomGradeService
            .findGradeParticipantJF(this.id)
            .pipe(
                finalize(() => this.participantScoreLoading.set(false)),
            )
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

    getAllParticipantScore() {
        this.allParticipantScoreLoading.set(true)

        if (!this.ukomDetail()?.roomUkomDto?.examScheduleDtoList?.length) {
            this.allParticipantScoreLoading.set(false)
            return
        }

        const requests = this.ukomDetail().roomUkomDto.examScheduleDtoList.map(
            (examSchedule) => {
                return this.examGradeService
                    .getExamGradeByExamScheduleIdAndParticipantId(
                        examSchedule.id,
                        this.id,
                    )
                    .pipe(
                        catchError((err) => {
                            console.error('Gagal mangambil score exam', err)
                            return of(null)
                        }),
                        map((res) => {
                            let scoreInstance: ScoreValue = null
                            if (res) {
                                switch (examSchedule.examTypeCode) {
                                    case ExamTypeCategory.CAT:
                                        scoreInstance = new CATScore(res)
                                        break
                                    case ExamTypeCategory.MAKALAH:
                                        scoreInstance = new MakalahScore(res)
                                        break
                                    default:
                                        scoreInstance = res
                                }
                            }
                            return { examSchedule, scoreInstance }
                        }),
                    )
            },
        )

        forkJoin(requests)
            .pipe(
                tap((results) => {
                    results.forEach((result) => {
                        if (result?.examSchedule?.id) {
                            this.examScoresByScheduleId[
                                result.examSchedule.id
                            ] = result.scoreInstance
                        }
                    })
                }),
                finalize(() => {
                    this.allParticipantScoreLoading.set(false)
                }),
            )
            .subscribe({
                next: () => {},
                error: (error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data nilai ujian',
                    )
                },
            })
    }

    getSelectedScore() {
        return this.selectedScheduleId()
            ? this.examScoresByScheduleId[this.selectedScheduleId()]
            : null
    }
}
