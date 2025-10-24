import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { Component, OnDestroy } from '@angular/core'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../modules/maintenance/models/pangkat.model'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
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
import { CommonModule } from '@angular/common'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { CATSchore } from '../../../modules/ukom/models/cat/cat-schore'
import { Router } from '@angular/router'
import { DataDokumenUkom } from '../../../modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ExamType } from '../../../modules/ukom/models/exam-type'
import { MakalahScore } from '../../../modules/ukom/models/cat/makalah-score'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { TanggalIndoPipe } from '../../../modules/base/pipes/tanggal-indo.pipe'
import { UkomGradeTableComponent } from '../../../modules/base/components/ukom-grade-table/ukom-grade-table.component'
import { UkomGradeService } from '../../../modules/ukom/services/ukom-grade.service'
import { UkomGrade } from '../../../modules/ukom/models/ukom-grade'
@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [
        CommonModule,
        ModalComponent,
        FileHandlerComponent,
        TanggalIndoPipe,
        UkomGradeTableComponent,
    ],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss',
})
export class UkomTaskDetailComponent implements OnDestroy {
    private destroy$ = new Subject<void>()

    id: string

    jenjang: Jenjang = new Jenjang()
    pangkat: Pangkat = new Pangkat()

    ukomDetail = new UkomTaskDetail()
    ukomDetailLoading$ = new BehaviorSubject<boolean>(false)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    dataDokumenUkom: DataDokumenUkom[] = []

    fileHandlerData: FIleHandler = {
        files: {},
        viewOnly: true,
    }

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string
    unitKerjaName: string | null = null

    predikatKinerjaList: any[] = []
    examType: ExamType[] = []

    scoreMap: Record<string, any> = {}
    isPredikatKerjaLoading$: BehaviorSubject<boolean> = new BehaviorSubject(
        false,
    )
    isAllSchoreLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    ukomGrade: UkomGrade

    constructor(
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private handlerService: HandlerService,
        private filePreviewService: FilePreviewService,
        private ukomGradeService: UkomGradeService,
    ) {
        this.isLoading$ = combineLatest([
            this.isAllSchoreLoading$,
            this.isPredikatKerjaLoading$,
            this.ukomDetailLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        this.initializeComponent()
    }

    getJenisUkomLabel(jenisUkom: string): string {
        switch (jenisUkom) {
            case 'KENAIKAN_JENJANG':
                return 'Kenaikan Jenjang'
            case 'PERPINDAHAN_JABATAN':
                return 'Perpindahan Jabatan'
            case 'PROMOSI':
                return 'Promosi'
            case 'PROMOSI_JF':
                return 'Promosi Jabatan Fungsional'
            default:
                return jenisUkom
        }
    }

    ngOnDestroy() {
        this.destroy$.next()
        this.destroy$.complete()
    }

    initializeComponent() {
        this.isPredikatKerjaLoading$.next(true)

        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                takeUntil(this.destroy$),
                switchMap((res) => {
                    this.predikatKinerjaList = res
                    return this.activatedRoute.paramMap.pipe(take(1))
                }),
                tap((params) => {
                    this.id = params.get('id')
                }),
                finalize(() => {
                    this.isPredikatKerjaLoading$.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    if (this.id) {
                        console.log('Starting to load dependent data...')
                        this.getParticipantUkomDetail()
                        this.getDokumenUkomList()
                        this.getAllScoresFlow()
                    } else {
                        console.error('No ID found in route parameters')
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

    getExamType(): Observable<ExamType[]> {
        return this.apiService.getData('/api/v1/exam_type').pipe(
            takeUntil(this.destroy$),
            map((response: any[]) =>
                response.map((item) => new ExamType(item)),
            ),
            tap((examTypes) => {
                this.examType = examTypes
                console.log('Exam types loaded:', examTypes)
            }),
            catchError((error) => {
                console.error('Failed to fetch exam types:', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil jenis ujian',
                )
                return of([])
            }),
        )
    }

    getAllScoresFlow(): void {
        if (!this.id) {
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

                    const requests = examTypes.map((type) => {
                        const examCode = type.code
                        return this.apiService
                            .getData(
                                `/api/v1/exam_grade/${examCode}/${this.id}`,
                            )
                            .pipe(
                                takeUntil(this.destroy$),
                                catchError((error) => {
                                    console.error(
                                        `Failed to fetch score for ${examCode}:`,
                                        error,
                                    )
                                    return of(null)
                                }),
                                map((response) => {
                                    if (!response) {
                                        return { examCode, scoreInstance: null }
                                    }

                                    let scoreInstance: any
                                    switch (examCode) {
                                        case 'CAT':
                                            scoreInstance = new CATSchore(
                                                response,
                                            )
                                            break
                                        case 'MAKALAH':
                                            scoreInstance = new MakalahScore(
                                                response,
                                            )
                                            break
                                        default:
                                            scoreInstance = response
                                    }
                                    return { examCode, scoreInstance }
                                }),
                            )
                    })

                    return forkJoin(requests)
                }),
                tap((results) => {
                    results.forEach((result) => {
                        if (result && result.examCode && result.scoreInstance) {
                            this.scoreMap[result.examCode] =
                                result.scoreInstance
                        }
                    })
                }),
                finalize(() => {
                    this.isAllSchoreLoading$.next(false)
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

    getPendidikanList(pendidikanTerakhirCode: string) {
        if (!pendidikanTerakhirCode) {
            this.pendidikanName = null
            return
        }

        this.apiService
            .getData(`/api/v1/pendidikan`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    const matchedPendidikan = response.find(
                        (pendidikan: any) =>
                            pendidikan.code === pendidikanTerakhirCode,
                    )
                    this.pendidikanName = matchedPendidikan
                        ? matchedPendidikan.name
                        : null
                },
                error: (err) => {
                    console.error('Failed to fetch pendidikan:', err)
                    this.pendidikanName = null
                },
            })
    }

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        if (!bidangJabatanCode) {
            this.bidangJabatanName = null
            return
        }

        this.apiService
            .getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.bidangJabatanName = response.name ?? null
                },
                error: (err) => {
                    console.error('Failed to fetch bidang jabatan:', err)
                    this.bidangJabatanName = null
                },
            })
    }

    getProvinsiNameByCode(provinsiCode: string) {
        if (!provinsiCode) {
            this.provinsiName = null
            return
        }

        this.apiService
            .getData(`/api/v1/provinsi/${provinsiCode}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.provinsiName = response.name ?? null
                },
                error: (err) => {
                    console.error('Failed to fetch provinsi:', err)
                    this.provinsiName = null
                },
            })
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        if (!kabupatenCode) {
            this.kabupatenName = null
            this.typeKabKota = null
            return
        }

        this.apiService
            .getData(`/api/v1/kab_kota/${kabupatenCode}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.kabupatenName = response.name ?? null
                    this.typeKabKota = response.type ?? null
                },
                error: (err) => {
                    console.error('Failed to fetch kabupaten:', err)
                    this.kabupatenName = null
                    this.typeKabKota = null
                },
            })
    }

    downloadRekomendasi(): void {
        const url = this.ukomDetail.rekomendasiUrl

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
            const filename = this.ukomDetail.rekomendasi || 'rekomendasi.pdf'

            this.apiService
                .getDownload(relativePath, filename)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log('Download completed')
                    },
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

    getPredikatKinerja(code: string | null): string {
        if (!code || code == null) return '-'

        const predikat = this.predikatKinerjaList.find(
            (predikat) => predikat.id === code,
        )
        return predikat ? predikat.name : '-'
    }

    transformInstansiName(value: string): string {
        if (!value) return null

        return value
            .toLowerCase() // Ubah ke lowercase semua dulu
            .replace(/_/g, ' ') // Ganti underscore dengan spasi
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Kapitalisasi setiap kata
    }

    mapDokumenUkom() {
        // Clear existing files first
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
        if (!this.id) {
            console.warn('getDokumenUkomList: No ID available')
            return
        }

        this.apiService
            .getData(`/api/v1/document_ukom/participant/${this.id}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: DataDokumenUkom[]) => {
                    console.log('Dokumen ukom loaded:', response)
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

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    backToList() {
        this.router.navigate(['/ukom/ukom-list'])
    }

    getGroupedCompetencies(): any[] {
        if (!this.scoreMap['CAT']?.kompetensiIndikatorDtoList) {
            return []
        }

        // Group by kompetensiId
        const grouped = this.scoreMap['CAT'].kompetensiIndikatorDtoList.reduce(
            (acc: any, kompetensi: any) => {
                const key = kompetensi.kompetensiId || 'default'

                if (!acc[key]) {
                    acc[key] = {
                        name: kompetensi.kompetensiName || '-',
                        items: [],
                        total: 0,
                        correct: 0,
                    }
                }

                acc[key].items.push(kompetensi)
                acc[key].total += kompetensi.questionDtoList?.length || 0
                acc[key].correct += this.getCorrectAnswersCount(kompetensi)

                return acc
            },
            {},
        )

        return Object.values(grouped).map((group: any) => ({
            ...group,
            percentage:
                group.total > 0
                    ? Math.round((group.correct / group.total) * 100)
                    : 0,
        }))
    }

    getCorrectAnswer(question: any): string {
        if (!question?.multipleChoiceDtoList) {
            return ''
        }

        const correctChoice = question.multipleChoiceDtoList.find(
            (choice: any) => choice.correct,
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
                this.getCorrectAnswer(question),
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

    getUnitKerjaById(unit_kerja_id: string) {
        if (!unit_kerja_id) {
            this.unitKerjaName = null
            return
        }

        this.apiService
            .getData(`/api/v1/unit_kerja/${unit_kerja_id}`)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response: any) => {
                    this.unitKerjaName = response.name
                },
                error: (err) => {
                    console.error('Failed to fetch unit kerja:', err)
                    this.unitKerjaName = null
                },
            })
    }

    get hasVisibleUkomDetails(): boolean {
        if (!this.scoreMap) {
            return false
        }

        const hasCatScore = this.scoreMap['CAT']?.id
        const hasMakalahFile = this.scoreMap['MAKALAH']?.id

        return !!(hasCatScore || hasMakalahFile)
    }

    viewFile() {
        const answerDto =
            this.scoreMap['MAKALAH']?.questionDtoList?.[0]?.answerDto

        console.log('Answer DTO:', this.scoreMap['MAKALAH'])

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

    getParticipantUkomDetail() {
        if (!this.id) {
            console.warn('getParticipantUkomDetail: No ID available')
            return
        }

        this.ukomDetailLoading$.next(true)

        this.apiService
            .getData(`/api/v1/participant_ukom/${this.id}`)
            .pipe(
                takeUntil(this.destroy$),
                tap(() => {
                    this.ukomGradeService
                        .findGradeParticipantJF(this.id)
                        .subscribe({
                            next: (response) => {
                                this.ukomGrade = new UkomGrade(response)
                            },
                        })
                }),
                finalize(() => {
                    this.ukomDetailLoading$.next(false)
                }),
            )
            .subscribe({
                next: (response) => {
                    this.ukomDetail = response

                    if (!response.unitKerjaName && response.unitKerjaId) {
                        this.getUnitKerjaById(response.unitKerjaId)
                    }

                    this.getPendidikanList(
                        this.ukomDetail.pendidikanTerakhirCode,
                    )

                    if (this.ukomDetail.provinsiId) {
                        this.getProvinsiNameByCode(this.ukomDetail.provinsiId)
                    }

                    if (this.ukomDetail.kabupatenKotaId) {
                        this.getKabupatenNameByCode(
                            this.ukomDetail.kabupatenKotaId,
                        )
                    }

                    if (this.ukomDetail.bidangJabatanCode) {
                        this.getBidangjabatanNameByCode(
                            this.ukomDetail.bidangJabatanCode,
                        )
                    }

                    this.predikat1Name = this.getPredikatKinerja(
                        this.ukomDetail.predikatKinerja1Id,
                    )
                    this.predikat2Name = this.getPredikatKinerja(
                        this.ukomDetail.predikatKinerja2Id,
                    )
                },
                error: (error) => {
                    console.error(
                        'Failed to fetch participant ukom detail:',
                        error,
                    )
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat detail peserta ukom',
                    )
                },
            })
    }
}
