import { FilePreviewComponent } from './../file-preview/file-preview.component'
import { Component } from '@angular/core'
import { UkomTaskDetail } from '../../../ukom/models/ukom-task-detail.modal'
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
    tap
} from 'rxjs'
import { LoginContext } from '../../commons/login-context'
import { ModalComponent } from '../modal/modal.component'
import { CommonModule } from '@angular/common'
import { ConverterService } from '../../services/converter.service'
import { ApiService } from '../../services/api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { NonjfRevisiUkomComponent } from '../nonjf-revisi-ukom/nonjf-revisi-ukom.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { EmptyStateComponent } from '../empty-state/empty-state.component'
import { LandingPageComponent } from '../../../landing-page/landing-page.component'
import { CATSchore } from '../../../../modules/ukom/models/cat/cat-schore'
import { DataDokumenUkom } from '../../../../modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { HandlerService } from '../../services/handler.service'
import { ExamType } from '../../../ukom/models/exam-type'
import { PredikatKinerja } from '../../../maintenance/models/predikat-kinerja.model'
import { MakalahScore } from '../../../ukom/models/cat/makalah-score'
import { FilePreviewService } from '../../services/file-preview.service'

export enum JenisUkomEnum {
    PERPINDAHAN_JABATAN = 'Perpindahan Jabatan',
    KENAIKAN_JENJANG = 'Kenaikan Jenjang',
    PROMOSI = 'Promosi',
    PROMOSI_JF = 'Promosi Jabatan Fungsional'
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
        FilePreviewComponent
    ],
    templateUrl: './status-pendaftaran-ukom.component.html',
    styleUrl: './status-pendaftaran-ukom.component.scss'
})
export class StatusPendaftaranUkomComponent {
    private destroy$ = new Subject<void>()

    pendingTask: UkomTaskDetail = new UkomTaskDetail()
    groupedUkomPendingTaskHistory: { [key: string]: any[] } = {}

    ukomStep$ = new BehaviorSubject<number>(1)
    currentUkomStep$ = new BehaviorSubject<number>(1)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

    finishTask: UkomTaskDetail = new UkomTaskDetail()
    CATSchore: CATSchore = new CATSchore()
    isCATModalOpen$ = new BehaviorSubject<boolean>(false)
    dataDokumenUkom: DataDokumenUkom[] = []

    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true
    }
    predikatKinerjaList: PredikatKinerja[] = []

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    key: string
    participantId: string

    examType: ExamType[] = []
    scoreMap: Record<string, any> = {}

    isPredikatKerjaLoading$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingPendingTask$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingPendidikan$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingProvinsi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )
    isLoadingKabupaten$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoadingBidangJabatan$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isAllSchoreLoading$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>

    registrationStatus: string

    constructor(
        private converterService: ConverterService,
        private apiService: ApiService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private handlerService: HandlerService,
        private filePreviewService: FilePreviewService
    ) {
        this.isLoading$ = combineLatest([
            this.isPredikatKerjaLoading$,
            this.isLoadingPendingTask$,
            this.isLoadingPendidikan$,
            this.isLoadingProvinsi$,
            this.isLoadingKabupaten$,
            this.isLoadingBidangJabatan$,
            this.isAllSchoreLoading$
        ]).pipe(map(loadings => loadings.some(isLoading => isLoading)))
    }

    ngOnInit() {
        this.initializeComponent()
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    private initializeComponent() {
        this.isPredikatKerjaLoading$.next(true)

        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                takeUntil(this.destroy$),
                switchMap(res => {
                    this.predikatKinerjaList = res
                    return this.activatedRoute.queryParamMap.pipe(take(1))
                }),
                tap(params => {
                    this.key = params.get('key')
                }),
                finalize(() => {
                    this.isPredikatKerjaLoading$.next(false)
                })
            )
            .subscribe({
                next: () => {
                    if (this.key) {
                        this.getPendingTask(this.key)
                    } else {
                        console.error('No ID found in route parameters')
                        this.handlerService.handleAlert(
                            'Error',
                            'ID tidak ditemukan dalam parameter route'
                        )
                    }
                },
                error: err => {
                    console.error('Failed to initialize component:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data awal'
                    )
                }
            })
    }

    getPendidikanList(pendidikanTerakhirCode: string) {
        this.isLoadingPendidikan$.next(true)
        this.apiService.getData(`/api/v1/pendidikan`).subscribe({
            next: response => {
                const matchedPendidikan = response.find(
                    (pendidikan: any) =>
                        pendidikan.code === pendidikanTerakhirCode
                )
                this.pendidikanName = matchedPendidikan
                    ? matchedPendidikan.name
                    : null
                this.isLoadingPendidikan$.next(false)
            },
            error: () => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat data pendidikan'
                )
                this.isLoadingPendidikan$.next(false)
            }
        })
    }

    downloadRekomendasi(): void {
        const url = this.finishTask.rekomendasiUrl

        if (!url) return

        const parsedUrl = new URL(url)
        const relativePath = parsedUrl.pathname + parsedUrl.search

        const filename = this.finishTask.rekomendasi || 'rekomendasi.pdf'

        this.apiService.getDownload(relativePath, filename).subscribe({
            next: () => { },
            error: err => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengunduh rekomendasi'
                )
            }
        })
    }

    mapDokumenUkom() {
        this.dataDokumenUkom.forEach((doc, index) => {
            this.fileHandlerData.files[`file${index}`] = {
                label: doc.dokumenPersyaratanName,
                source: doc.dokumenUrl,
                id: doc.id,
                required: false
            }
        })
    }

    toggleCATModal() {
        this.isCATModalOpen$.next(!this.isCATModalOpen$.value)
    }

    backToLandingPage() {
        this.router.navigate(['/'])
    }

    fetchPhotoProfile() {
        this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
            next: blob => {
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc =
                    this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
            error: err => {
                console.error('Error fetching profile image', err)
                this.profileImageSrc = 'assets/no-profile.jpg'
            }
        })
    }

    getJenisUkomLabel(jenisUkom: string): string {
        return JenisUkomEnum[jenisUkom as keyof typeof JenisUkomEnum] || '-'
    }

    getProvinsiNameByCode(provinsiCode: string) {
        this.isLoadingProvinsi$.next(true)
        this.apiService.getData(`/api/v1/provinsi/${provinsiCode}`).subscribe({
            next: response => {
                this.provinsiName = response.name ?? null
                this.isLoadingProvinsi$.next(false)
            },
            error: error => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat data provinsi'
                )
                this.isLoadingProvinsi$.next(false)
            }
        })
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        this.isLoadingKabupaten$.next(true)
        this.apiService.getData(`/api/v1/kab_kota/${kabupatenCode}`).subscribe({
            next: response => {
                this.kabupatenName = response.name ?? null
                this.typeKabKota = response.type ?? null
                this.isLoadingKabupaten$.next(false)
            },
            error: error => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat data kabupaten'
                )
                this.isLoadingKabupaten$.next(false)
            }
        })
    }

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.isLoadingBidangJabatan$.next(true)
        this.apiService
            .getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`)
            .subscribe({
                next: response => {
                    this.bidangJabatanName = response.name ?? null
                    this.isLoadingBidangJabatan$.next(false)
                },
                error: error => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data bidang jabatan'
                    )
                    this.isLoadingBidangJabatan$.next(false)
                }
            })
    }

    getPredikatKinerja(code: string | null): string {
        if (!code || code == null) return '-'
        const predikat = this.predikatKinerjaList.find(
            predikat => predikat.id === code
        )
        return predikat ? predikat.name : '-'
    }

    getPendingTask(key: string): void {
        this.isLoadingPendingTask$.next(true)

        this.apiService
            .getData(`/api/v1/participant_ukom_detail?key=${key}`)
            .pipe(
                tap((response: any) => {
                    this.getPendidikanList(response.data.pendidikanTerakhirCode)
                    if (response.data.provinsiId) {
                        this.getProvinsiNameByCode(response.data.provinsiId)
                    }
                    if (response.data.kabupatenKotaId) {
                        this.getKabupatenNameByCode(
                            response.data.kabupatenKotaId
                        )
                    }
                    if (response.data.bidangJabatanCode) {
                        this.getBidangjabatanNameByCode(
                            response.data.bidangJabatanCode
                        )
                    }
                    this.predikat1Name = this.getPredikatKinerja(
                        response.data.predikatKinerja1Id
                    )
                    this.predikat2Name = this.getPredikatKinerja(
                        response.data.predikatKinerja2Id
                    )
                    this.participantId = response.data.id
                }),
                tap((response: any) => {
                    if (response.status === 'pending') {
                        this.registrationStatus = 'pending'
                        this.pendingTask = response.data

                        const step =
                            response.data.flowId === 'ukom_flow_2' ? 2 : 1
                        this.ukomStep$.next(step)
                        this.currentUkomStep$.next(step)

                        if (this.pendingTask.pendingTaskHistory?.length > 0) {
                            this.groupedUkomPendingTaskHistory =
                                this.groupAndSortTasksByFlowId(
                                    this.pendingTask.pendingTaskHistory
                                )
                        }
                    }

                    if (response.status === 'finish') {
                        this.registrationStatus = 'finish'
                        this.finishTask = response.data
                        this.dataDokumenUkom = response.data.documentUkomList
                        this.mapDokumenUkom()
                        this.getAllScoresFlow()
                    }

                    if (response.status === 'failed') {
                        this.registrationStatus = 'failed'
                        this.finishTask = response.data
                        console.log('Failed task:', this.finishTask)
                        this.dataDokumenUkom = response.data.dokumenUkomList
                        console.log('Data dokumen UKOM:', this.dataDokumenUkom)
                        this.mapDokumenUkom()
                        // this.getAllScoresFlow()
                    }
                }),
                finalize(() => this.isLoadingPendingTask$.next(false))
            )
            .subscribe({
                error: error => {
                    this.isLoadingPendingTask$.next(false)
                    console.error(error)
                }
            })
    }

    getExamType(): Observable<ExamType[]> {
        return this.apiService.getData('/api/v1/exam_type').pipe(
            takeUntil(this.destroy$),
            map((response: any[]) => response.map(item => new ExamType(item))),
            tap(examTypes => {
                this.examType = examTypes
            }),
            catchError(error => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil jenis ujian'
                )
                return of([])
            })
        )
    }

    getAllScoresFlow(): void {
        if (!this.participantId) {
            console.warn('getAllScoresFlow: No ID available, aborting')
            return
        }

        this.isAllSchoreLoading$.next(true)

        this.getExamType()
            .pipe(
                takeUntil(this.destroy$),
                switchMap((examTypes: ExamType[]) => {
                    if (!examTypes.length) {
                        console.warn('No exam types available')
                        return of([])
                    }

                    const requests = examTypes.map(type => {
                        const examCode = type.code
                        return this.apiService
                            .getData(
                                `/api/v1/exam_grade/${examCode}/${this.participantId}`
                            )
                            .pipe(
                                takeUntil(this.destroy$),
                                catchError(error => {
                                    console.error(
                                        `Failed to fetch score for ${examCode}:`,
                                        error
                                    )
                                    return of(null)
                                }),
                                map(response => {
                                    if (!response) {
                                        return { examCode, scoreInstance: null }
                                    }

                                    let scoreInstance: any
                                    switch (examCode) {
                                        case 'CAT':
                                            scoreInstance = new CATSchore(
                                                response
                                            )
                                            break
                                        case 'MAKALAH':
                                            scoreInstance = new MakalahScore(
                                                response
                                            )
                                            break
                                        default:
                                            scoreInstance = response
                                    }
                                    return { examCode, scoreInstance }
                                })
                            )
                    })

                    return forkJoin(requests)
                }),
                tap(results => {
                    results.forEach(result => {
                        if (result && result.examCode && result.scoreInstance) {
                            this.scoreMap[result.examCode] =
                                result.scoreInstance
                        }
                    })
                }),
                finalize(() => {
                    this.isAllSchoreLoading$.next(false)
                })
            )
            .subscribe({
                next: () => { },
                error: error => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data nilai ujian'
                    )
                }
            })
    }

    calculateAge(
        tanggalLahir: string | Date,
        tglSuratUsulan: string | Date
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
                0
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
            .replace(/\b\w/g, char => char.toUpperCase())
    }

    groupAndSortTasksByFlowId(tasks: any[]): { [key: string]: any[] } {
        const grouped = tasks.reduce((acc, task) => {
            if (!acc[task.flowId]) {
                acc[task.flowId] = []
            }
            acc[task.flowId].push(task)
            return acc
        }, {} as { [key: string]: any[] })

        Object.keys(grouped).forEach(flowId => {
            grouped[flowId].sort((a: any, b: any) => {
                const dateA = new Date(a.lastUpdated).getTime()
                const dateB = new Date(b.lastUpdated).getTime()
                return dateA - dateB
            })
        })

        return grouped
    }

    // handleStepClick (clickedStep: number) {
    //     this.currentUkomStep$.subscribe(step => {
    //         if (clickedStep <= step) {
    //             this.ukomStep$.next(clickedStep)
    //         }
    //     })
    // }
    handleStepClick(clickedStep: number) {
        // Get the current value directly without subscribing
        if (clickedStep <= this.currentUkomStep$.value) {
            this.ukomStep$.next(clickedStep)
        }
    }

    viewFile() {
        const answerDto =
            this.scoreMap['MAKALAH']?.questionDtoList?.[0]?.answerDto

        if (!answerDto) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file yang tersedia untuk ditampilkan.'
            )
            return
        }

        this.filePreviewService.open(
            answerDto.answerUpload,
            answerDto.answerUploadUrl
        )
    }

    get hasVisibleUkomDetails(): boolean {
        if (!this.scoreMap) {
            return false
        }

        const hasCatScore = this.scoreMap['CAT']?.id
        const hasMakalahFile = this.scoreMap['MAKALAH']?.id

        return !!(hasCatScore || hasMakalahFile)
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    convertDate(date: string) {
        return this.converterService.dateToHumanReadable(date)
    }

    getGroupedCompetencies(): any[] {
        if (!this.scoreMap['CAT']?.kompetensiIndikatorDtoList) {
            return []
        }

        const grouped = this.scoreMap['CAT']?.kompetensiIndikatorDtoList.reduce(
            (acc: any, kompetensi: any) => {
                const key = kompetensi.kompetensiId || 'default'

                if (!acc[key]) {
                    acc[key] = {
                        name: kompetensi.kompetensiName || '-',
                        items: [],
                        total: 0,
                        correct: 0
                    }
                }

                acc[key].items.push(kompetensi)
                acc[key].total += kompetensi.questionDtoList?.length || 0
                acc[key].correct += this.getCorrectAnswersCount(kompetensi)

                return acc
            },
            {}
        )

        return Object.values(grouped).map((group: any) => ({
            ...group,
            percentage:
                group.total > 0
                    ? Math.round((group.correct / group.total) * 100)
                    : 0
        }))
    }

    getCorrectAnswer(question: any): string {
        const correctChoice = question.multipleChoiceDtoList.find(
            (choice: any) => choice.correct
        )
        return correctChoice ? correctChoice.choiceId : ''
    }

    getCompetencyPercentage(kompetensi: any): number {
        if (
            !kompetensi.questionDtoList ||
            kompetensi.questionDtoList.length === 0
        ) {
            return 0
        }

        const correctAnswers = this.getCorrectAnswersCount(kompetensi)
        const totalQuestions = kompetensi.questionDtoList.length

        return Math.round((correctAnswers / totalQuestions) * 100)
    }

    getCorrectAnswersCount(kompetensi: any): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return kompetensi.questionDtoList.filter(
            (question: any) =>
                question.answerDto?.answerChoice ===
                this.getCorrectAnswer(question)
        ).length
    }

    getWrongAnswersCount(kompetensi: any): number {
        if (!kompetensi.questionDtoList) {
            return 0
        }

        return (
            kompetensi.questionDtoList.length -
            this.getCorrectAnswersCount(kompetensi)
        )
    }
}
