import { Component, inject } from '@angular/core'
import { UkomTaskDetail } from '@/modules/ukom/models/ukom-task-detail.modal'
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    finalize,
    forkJoin,
    map,
    Observable,
    of,
    Subject,
    switchMap,
    take,
    takeUntil,
    tap,
} from 'rxjs'
import { ModalComponent } from '../modal/modal.component'
import { CommonModule } from '@angular/common'
import { ConverterService } from '@/modules/base/services/converter.service'
import { ApiService } from '@/modules/base/services/api.service'
import { ActivatedRoute, Router } from '@angular/router'
import { NonjfRevisiUkomComponent } from '../nonjf-revisi-ukom/nonjf-revisi-ukom.component'
import { SafeUrl } from '@angular/platform-browser'
import { EmptyStateComponent } from '../empty-state/empty-state.component'
import { LandingPageComponent } from '@/modules/landing-page/landing-page.component'
import {
    CATScore,
    MakalahScore,
} from '@/modules/ukom/models/exam/exam-score.model'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { PredikatKinerja } from '@/modules/maintenance/models/predikat-kinerja.model'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { UkomGradeService } from '@/modules/ukom/services/ukom-grade.service'
import { UkomGrade } from '@/modules/ukom/models/ukom-grade'
import { UkomGradeTableComponent } from '../ukom-grade-table/ukom-grade-table.component'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { ReplaceUkomWordPipe } from '@/modules/base/pipes/replace-ukom-word.pipe'
import { NonJFParticipant } from '@/modules/base/models/nonjf-participant.model'
import { DokumenUkom } from '@/modules/ukom/models/ukom-registration-refactored/document.model'
import { CatScoreComponent } from '@/modules/ukom/components/cat-score/cat-score.component'
import { GenericScoreComponent } from '@/modules/ukom/components/generic-score/generic-score.component'
import { Pendidikan } from '@/modules/maintenance/models/pendidikan.model'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'

export enum JenisUkomEnum {
    PERPINDAHAN_JABATAN = 'Perpindahan Jabatan',
    KENAIKAN_JENJANG = 'Kenaikan Jenjang',
    PROMOSI = 'Promosi',
    PROMOSI_JF = 'Promosi Jabatan Fungsional',
}
@Component({
    selector: 'app-status-pendaftaran-ukom',
    standalone: true,
    imports: [
        ModalComponent,
        CommonModule,
        NonjfRevisiUkomComponent,
        EmptyStateComponent,
        LandingPageComponent,
        FileHandlerComponent,
        UkomGradeTableComponent,
        ReplaceUkomWordPipe,
        CatScoreComponent,
        GenericScoreComponent,
        TanggalWaktuIndoPipe,
    ],
    templateUrl: './status-pendaftaran-ukom.component.html',
    styleUrl: './status-pendaftaran-ukom.component.scss',
})
export class StatusPendaftaranUkomComponent {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    pendingTask = new UkomTaskDetail()
    finishTask = new UkomTaskDetail()

    groupedUkomPendingTaskHistory: {
        [key: string]: any[]
    } = {}
    ukomStep$ = new BehaviorSubject<number>(1)
    currentUkomStep$ = new BehaviorSubject<number>(1)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'
    CATScore = new CATScore()
    isCATModalOpen$ = new BehaviorSubject<boolean>(false)
    dataDokumenUkom: DokumenUkom[] = []
    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true,
    }
    predikatKinerjaList: PredikatKinerja[] = []
    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    predikat1Id: string
    predikat2Id: string
    bidangJabatanName: string
    key: string
    participantId: string
    examScoresByScheduleId: Record<string, any> = {}
    selectedScheduleId: string | null = null
    selectedExamTypeCode: string | null = null
    isPredikatKerjaLoading$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingPendingTask$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingPendidikan$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingProvinsi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )
    isLoadingKabupaten$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingBidangJabatan$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isAllSchoreLoading$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>
    registrationStatus: string
    ukomGrade: UkomGrade
    scheduleMap = new Map<string, ExamSchedule>()
    protected readonly ExamTypeCategory = ExamTypeCategory
    private destroy$ = new Subject<void>()

    constructor(
        private converterService: ConverterService,
        private apiService: ApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService,
        private filePreviewService: FilePreviewService,
        private ukomGradeService: UkomGradeService,
        public kinerjaService: KinerjaService,
    ) {
        this.isLoading$ = combineLatest([
            this.isPredikatKerjaLoading$,
            this.isLoadingPendingTask$,
            this.isLoadingPendidikan$,
            this.isLoadingProvinsi$,
            this.isLoadingKabupaten$,
            this.isLoadingBidangJabatan$,
            this.isAllSchoreLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    get hasVisibleUkomDetails(): boolean {
        return this.hasAnyScores()
    }

    getScoreByScheduleId(scheduleId: string): any | null {
        return this.examScoresByScheduleId[scheduleId] || null
    }

    hasAnyScores(): boolean {
        return Object.values(this.examScoresByScheduleId).some(
            (score) => score !== null && score !== undefined,
        )
    }

    getSelectedScore(): any {
        return this.selectedScheduleId
            ? this.examScoresByScheduleId[this.selectedScheduleId]
            : null
    }

    getSelectedExamType(): string | null {
        return this.selectedExamTypeCode
    }

    ngOnInit() {
        this.initializeComponent()
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    getPendidikanList(pendidikanTerakhirCode: string) {
        this.isLoadingPendidikan$.next(true)
        this.apiService.getData(`/api/v1/pendidikan`).subscribe({
            next: (response: Pendidikan[]) => {
                const matchedPendidikan = response.find(
                    (pendidikan) => pendidikan.code === pendidikanTerakhirCode,
                )
                this.pendidikanName = matchedPendidikan
                    ? matchedPendidikan.name
                    : null
                this.isLoadingPendidikan$.next(false)
            },
            error: () => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat data pendidikan',
                )
                this.isLoadingPendidikan$.next(false)
            },
        })
    }

    downloadRekomendasi(): void {
        const url = this.finishTask.rekomendasiUrl

        if (!url) return

        const parsedUrl = new URL(url)
        const relativePath = parsedUrl.pathname + parsedUrl.search

        const filename = this.finishTask.rekomendasi || 'rekomendasi.pdf'

        this.apiService.getDownload(relativePath, filename).subscribe({
            next: () => {},
            error: (err) => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengunduh rekomendasi',
                )
            },
        })
    }

    mapDokumenUkom() {
        this.dataDokumenUkom.forEach((doc, index) => {
            this.fileHandlerData.files[`file${index}`] = {
                label: doc.dokumenPersyaratanName,
                source: doc.dokumenUrl,
                id: doc.id,
                required: false,
            }
        })
    }

    toggleScoreModal(scheduleId?: string, examTypeCode?: string) {
        if (scheduleId && examTypeCode) {
            this.selectedScheduleId = scheduleId
            this.selectedExamTypeCode = examTypeCode
        }
        this.isCATModalOpen$.next(!this.isCATModalOpen$.value)
        if (!this.isCATModalOpen$.value) {
            this.selectedScheduleId = null
            this.selectedExamTypeCode = null
        }
    }

    backToLandingPage() {
        this.router.navigate(['/'])
    }

    getJenisUkomLabel(jenisUkom: string): string {
        return JenisUkomEnum[jenisUkom as keyof typeof JenisUkomEnum] || '-'
    }

    getProvinsiNameByCode(provinsiCode: string) {
        this.isLoadingProvinsi$.next(true)
        this.apiService.getData(`/api/v1/provinsi/${provinsiCode}`).subscribe({
            next: (response) => {
                this.provinsiName = response.name ?? null
                this.isLoadingProvinsi$.next(false)
            },
            error: (error) => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat data provinsi',
                )
                this.isLoadingProvinsi$.next(false)
            },
        })
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        this.isLoadingKabupaten$.next(true)
        this.apiService.getData(`/api/v1/kab_kota/${kabupatenCode}`).subscribe({
            next: (response) => {
                this.kabupatenName = response.name ?? null
                this.typeKabKota = response.type ?? null
                this.isLoadingKabupaten$.next(false)
            },
            error: (error) => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat data kabupaten',
                )
                this.isLoadingKabupaten$.next(false)
            },
        })
    }

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.isLoadingBidangJabatan$.next(true)
        this.apiService
            .getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`)
            .subscribe({
                next: (response) => {
                    this.bidangJabatanName = response.name ?? null
                    this.isLoadingBidangJabatan$.next(false)
                },
                error: (error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data bidang jabatan',
                    )
                    this.isLoadingBidangJabatan$.next(false)
                },
            })
    }

    getPredikatKinerja(name: string | null, code: string | null): string {
        if (name == null && code == null) return '-'

        if (name) {
            return name
        } else {
            const predikat = this.predikatKinerjaList.find(
                (predikat) => predikat.id === code,
            )
            return predikat ? predikat.name : '-'
        }
    }

    private toCamelCase(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.toCamelCase(item))
        }
        if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
                const camelKey = key.replace(/_([a-z0-9])/g, (_, c) =>
                    c.toUpperCase(),
                )
                acc[camelKey] = this.toCamelCase(obj[key])
                return acc
            }, {} as any)
        }
        return obj
    }

    getPendingTask(key: string) {
        this.isLoadingPendingTask$.next(true)

        this.apiService
            .getData(`/api/v1/participant_ukom_detail?key=${key}`)
            .pipe(
                map((response: any) => {
                    // convert cuma di sini, khusus endpoint ini
                    response.data = this.toCamelCase(response.data)
                    return new NonJFParticipant(response)
                }),
                tap((response: NonJFParticipant) => {
                    this.getPendidikanList(response.data.pendidikanTerakhirCode)
                    if (response.data.provinsiId) {
                        this.getProvinsiNameByCode(response.data.provinsiId)
                    }
                    if (response.data.kabupatenKotaId) {
                        this.getKabupatenNameByCode(
                            response.data.kabupatenKotaId,
                        )
                    }
                    if (response.data.bidangJabatanCode) {
                        this.getBidangjabatanNameByCode(
                            response.data.bidangJabatanCode,
                        )
                    }
                    this.predikat1Id = response.data.predikatKinerja1Id ?? '-'
                    this.predikat2Id = response.data.predikatKinerja2Id ?? '-'
                    this.predikat1Name =
                        response.data.predikatKinerja1Name ?? '-'
                    this.predikat2Name =
                        response.data.predikatKinerja2Name ?? '-'
                    this.participantId = response.data.id
                }),
                tap((response: NonJFParticipant) => {
                    // console.log('response ukom  : ', response)

                    if (response.status === 'pending') {
                        this.registrationStatus = response.status
                        this.pendingTask = response.data

                        const step =
                            response.data.flowId === 'ukom_flow_2' ? 2 : 1
                        this.ukomStep$.next(step)
                        this.currentUkomStep$.next(step)

                        if (this.pendingTask.pendingTaskHistory?.length > 0) {
                            this.groupedUkomPendingTaskHistory =
                                this.groupAndSortTasksByFlowId(
                                    this.pendingTask.pendingTaskHistory,
                                )
                        }
                    }

                    if (response.status === 'finish') {
                        this.registrationStatus = response.status
                        this.finishTask = response.data
                        this.dataDokumenUkom = response.data.documentUkomList
                        this.mapDokumenUkom()

                        this.buildScheduleMap() // <-- HERE

                        this.getAllScoresFlow(key)
                    }

                    if (response.status === 'failed') {
                        this.registrationStatus = response.status
                        this.finishTask = response.data
                        this.dataDokumenUkom = response.data.documentUkomList
                        this.mapDokumenUkom()
                    }
                }),
                tap(() => {
                    this.ukomGradeService
                        .findGradeParticipantNonJF(key)
                        .subscribe({
                            next: (response) => {
                                this.ukomGrade = new UkomGrade(response)
                            },
                        })
                }),
                finalize(() => this.isLoadingPendingTask$.next(false)),
            )
            .subscribe({
                error: (error) => {
                    this.isLoadingPendingTask$.next(false)
                    console.error(error)
                },
            })
    }

    buildScheduleMap() {
        this.scheduleMap.clear()

        const schedules = this.finishTask?.examSchedule ?? []

        for (const s of schedules) {
            this.scheduleMap.set(s.id, s)
        }
    }
    getScheduleStartTime(scheduleId: string): string | null {
        return this.scheduleMap.get(scheduleId)?.startTime ?? null
    }

    getAllScoresFlow(key: string): void {
        this.isAllSchoreLoading$.next(true)

        if (!this.finishTask.examSchedule?.length) {
            console.warn('No exam schedules available')
            this.isAllSchoreLoading$.next(false)
            return
        }

        const requests = this.finishTask.examSchedule.map((examSchedule) => {
            return this.apiService
                .getData(`/api/v1/exam_grade/${examSchedule.id}?key=${key}`)
                .pipe(
                    takeUntil(this.destroy$),
                    catchError((error) => {
                        console.error(
                            `Failed to fetch score for exam schedule ${examSchedule.id}:`,
                            error,
                        )
                        return of(null)
                    }),
                    map((response) => {
                        let scoreInstance: any = null
                        if (response) {
                            switch (examSchedule.examTypeCode) {
                                case 'CAT':
                                    scoreInstance = new CATScore(response)
                                    break
                                case 'MAKALAH':
                                    scoreInstance = new MakalahScore(response)
                                    break
                                default:
                                    scoreInstance = response
                            }
                        }
                        return { examSchedule, scoreInstance }
                    }),
                )
        })

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
                    this.isAllSchoreLoading$.next(false)
                }),
                takeUntil(this.destroy$),
            )
            .subscribe({
                next: () => {
                    console.log('Scores loaded:', this.examScoresByScheduleId)
                },
                error: (error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data nilai ujian',
                    )
                },
            })
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

        if (suratDate < birthDate) {
            return 'Tanggal surat usulan tidak boleh sebelum tanggal lahir'
        }

        if (isNaN(birthDate.getTime()) || isNaN(suratDate.getTime())) {
            return '-'
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
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    groupAndSortTasksByFlowId(tasks: any[]): { [key: string]: any[] } {
        const grouped = tasks.reduce(
            (acc, task) => {
                if (!acc[task.flowId]) {
                    acc[task.flowId] = []
                }
                acc[task.flowId].push(task)
                return acc
            },
            {} as {
                [key: string]: any[]
            },
        )

        Object.keys(grouped).forEach((flowId) => {
            grouped[flowId].sort((a: any, b: any) => {
                const dateA = new Date(a.lastUpdated).getTime()
                const dateB = new Date(b.lastUpdated).getTime()
                return dateA - dateB
            })
        })

        return grouped
    }

    handleStepClick(clickedStep: number) {
        if (clickedStep <= this.currentUkomStep$.value) {
            this.ukomStep$.next(clickedStep)
        }
    }

    viewFile(scheduleId: string) {
        const score = this.getScoreByScheduleId(scheduleId)
        const answerDto = score?.questionDtoList?.[0]?.answerDto

        if (!answerDto) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file yang tersedia untuk ditampilkan.',
            )
            return
        }

        this.filePreviewService.open(
            answerDto.answerUpload,
            answerDto.answerUploadUrl,
        )
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    convertDate(date: string) {
        return this.converterService.dateToHumanReadable(date)
    }

    private initializeComponent() {
        this.isPredikatKerjaLoading$.next(true)

        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                takeUntil(this.destroy$),
                switchMap((res) => {
                    this.predikatKinerjaList = res
                    return this.activatedRoute.queryParamMap.pipe(take(1))
                }),
                tap((params) => {
                    this.key = params.get('key')
                }),
                finalize(() => {
                    this.isPredikatKerjaLoading$.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    if (this.key) {
                        this.getPendingTask(this.key)
                    } else {
                        this.handlerService.handleAlert(
                            'Error',
                            'ID tidak ditemukan dalam parameter route',
                        )
                    }
                },
                error: (err) => {
                    console.error('Failed to initialize component:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data awal',
                    )
                },
            })
    }
}
