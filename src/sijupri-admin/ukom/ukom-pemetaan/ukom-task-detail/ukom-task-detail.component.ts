import { Component } from '@angular/core'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import {
    BehaviorSubject,
    catchError,
    forkJoin,
    map,
    Observable,
    of,
    switchMap,
    tap,
    combineLatest,
    finalize,
    filter,
    EMPTY,
} from 'rxjs'
import { ApiService } from '../../../../modules/base/services/api.service'
import { UkomTaskDetail } from '../../../../modules/ukom/models/ukom-task-detail.modal'
import { CATSchore } from '../../../../modules/ukom/models/cat/cat-schore'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { DataDokumenUkom } from '../../../../modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ExamType } from '../../../../modules/ukom/models/exam-type'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { MakalahScore } from '../../../../modules/ukom/models/cat/makalah-score'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { LoadingButtonComponent } from '../../../../modules/base/components/loading-button/loading-button.component'
import { TanggalIndoPipe } from '../../../../modules/base/pipes/tanggal-indo.pipe'
import { ForcePasswordFormComponent } from '../../../../modules/base/components/force-password-form/force-password-form.component'
import { PredikatKinerjaService } from '@/modules/maintenance/services/predikat-kinerja.service'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [
        CommonModule,
        ModalComponent,
        FileHandlerComponent,
        LoadingButtonComponent,
        TanggalIndoPipe,
        ForcePasswordFormComponent,
        // UkomTaskDetailComponentPengajuan,
    ],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss',
})
export class UkomTaskDetailComponent {
    participant_ukom_id: string
    jabatan: Jabatan = new Jabatan()
    jenjang: Jenjang = new Jenjang()
    pangkat: Pangkat = new Pangkat()
    CATSchore: CATSchore = new CATSchore()
    dataDokumenUkom: DataDokumenUkom[] = []

    ukomDetail = new UkomTaskDetail()
    ukomDetailLoading$ = new BehaviorSubject<boolean>(false)
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    unitKerjaName: string | null = null

    examType: ExamType[] = []
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

    predikatKinerjaList: any[] = []

    scoreMap: Record<string, any> = {}

    isPredikatKerjaLoading$: BehaviorSubject<boolean> = new BehaviorSubject(
        false,
    )
    isAllSchoreLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    isDeleteExamScoreLoading$ = new BehaviorSubject<boolean>(false)

    isToggleUpdatePasswordModal$ = new BehaviorSubject<boolean>(false)
    constructor(
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private filePreviewService: FilePreviewService,
        private confirmationService: ConfirmationService,
        public predikatKinerjaService: PredikatKinerjaService,
        public pendidikanService: PendidikanService,
    ) {
        this.isLoading$ = combineLatest([
            this.isAllSchoreLoading$,
            this.isPredikatKerjaLoading$,
            this.ukomDetailLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        this.pendidikanService.fetchPendidikan()
        this.loadInitialDataFlow()
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

    getExamType(): Observable<ExamType[]> {
        return this.apiService.getData('/api/v1/exam_type').pipe(
            map((response: any[]) =>
                response.map((item) => new ExamType(item)),
            ),
            tap((examTypes) => {
                this.examType = examTypes
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

    private loadInitialDataFlow(): void {
        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                tap((res) => {
                    this.predikatKinerjaList = res
                }),
                switchMap(() => this.activatedRoute.paramMap),
                tap((params) => {
                    this.participant_ukom_id = params.get('id')
                    this.getParticipantUkomDetail()
                    this.getDokumenUkomList()
                }),
                filter(() => !!this.participant_ukom_id),
                switchMap(() => {
                    this.isAllSchoreLoading$.next(true)
                    return this.getExamType().pipe(
                        switchMap((examTypes: ExamType[]) => {
                            if (
                                !examTypes.length ||
                                !this.participant_ukom_id
                            ) {
                                console.warn(
                                    'Skipping API calls: Exam types or participant ID missing.',
                                )
                                return of([])
                            }

                            const requests = examTypes.map((type) => {
                                const examCode = type.code
                                return this.apiService
                                    .getData(
                                        `/api/v1/exam_grade/${examCode}/${this.participant_ukom_id}`,
                                    )
                                    .pipe(
                                        catchError((error) => {
                                            console.error(
                                                `Failed to fetch score for ${examCode}:`,
                                                error,
                                            )
                                            return of(null)
                                        }),
                                        map((response) => {
                                            let scoreInstance: any
                                            switch (examCode) {
                                                case 'CAT':
                                                    scoreInstance =
                                                        new CATSchore(response)
                                                    break
                                                case 'MAKALAH':
                                                    scoreInstance =
                                                        new MakalahScore(
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
                                if (result && result.examCode) {
                                    this.scoreMap[result.examCode] =
                                        result.scoreInstance
                                }
                            })
                        }),
                        finalize(() => {
                            this.isAllSchoreLoading$.next(false)
                        }),
                    )
                }),
                catchError((err) => {
                    console.error('Error in initial data flow:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data awal ujian',
                    )
                    this.isAllSchoreLoading$.next(false)
                    return of(null)
                }),
            )
            .subscribe()
    }

    getPendidikanName(pendidikanCode: string) {
        this.pendidikanName =
            this.pendidikanService.getPendidikanById(pendidikanCode)?.name ||
            '-'
    }

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.apiService
            .getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`)
            .subscribe({
                next: (response) => {
                    this.bidangJabatanName = response.name ?? null
                },
                error: (error) => {
                    console.error('Failed to fetch bidang jabatan:', error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data bidang jabatan',
                    )
                },
            })
    }

    getProvinsiNameByCode(provinsiCode: string) {
        this.apiService.getData(`/api/v1/provinsi/${provinsiCode}`).subscribe({
            next: (response) => {
                this.provinsiName = response.name ?? null
            },
            error: (error) => {
                console.error('Failed to fetch provinsi:', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data provinsi',
                )
            },
        })
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        this.apiService.getData(`/api/v1/kab_kota/${kabupatenCode}`).subscribe({
            next: (response) => {
                this.kabupatenName = response.name ?? null
                this.typeKabKota = response.type ?? null
            },
            error: (error) => {
                console.error('Failed to fetch kabupaten:', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data kabupaten',
                )
            },
        })
    }

    get hasVisibleUkomDetails(): boolean {
        if (!this.scoreMap) {
            return false
        }

        const hasCatScore = this.scoreMap['CAT'] && this.scoreMap['CAT'].id
        const hasMakalahFile =
            this.scoreMap['MAKALAH'] && this.scoreMap['MAKALAH'].id

        return !!(hasCatScore || hasMakalahFile)
    }

    transformInstansiName(value: string): string {
        if (!value) return null

        return value
            .toLowerCase() // Ubah ke lowercase semua dulu
            .replace(/_/g, ' ') // Ganti underscore dengan spasi
            .replace(/\b\w/g, (char) => char.toUpperCase()) // Kapitalisasi setiap kata
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

        // Jika bulan dalam tgl_surat_usulan kurang dari bulan lahir, atau bulan sama tapi tanggal lebih kecil
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

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    getUnitKerjaById(unit_kerja_id: string) {
        this.apiService
            .getData(`/api/v1/unit_kerja/${unit_kerja_id}`)
            .subscribe({
                next: (response: any) => {
                    this.unitKerjaName = response.name
                },
            })
    }

    back() {
        history.back()
    }

    viewFile() {
        const answerDto =
            this.scoreMap['MAKALAH']?.questionDtoList[0]?.answerDto

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

    getPredikatKinerja(code: string | null): string | null {
        if (!code || code == null) return null
        const predikat = this.predikatKinerjaList.find(
            (predikat) => predikat.id === code,
        )
        return predikat ? predikat.name : null
    }

    getParticipantUkomDetail() {
        this.ukomDetailLoading$.next(true)
        this.apiService
            .getData(`/api/v1/participant_ukom/${this.participant_ukom_id}`)
            .subscribe({
                next: (response) => {
                    this.ukomDetail = response
                    if (!response.unitKerjaName) {
                        this.getUnitKerjaById(response.unitKerjaId)
                    }

                    // this.getPendidikanList(
                    //     this.ukomDetail.pendidikanTerakhirCode,
                    // )
                    this.getPendidikanName(
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

                    this.predikat1Name =
                        this.getPredikatKinerja(
                            this.ukomDetail.predikatKinerja1Id,
                        ) ?? this.ukomDetail.predikatKinerja1Name
                    this.predikat2Name =
                        this.getPredikatKinerja(
                            this.ukomDetail.predikatKinerja2Id,
                        ) ?? this.ukomDetail.predikatKinerja2Name

                    this.ukomDetailLoading$.next(false)
                },
                error: (error) => {
                    this.ukomDetailLoading$.next(false)
                    console.log(error)
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

    getDokumenUkomList() {
        this.apiService
            .getData(
                `/api/v1/document_ukom/participant/${this.participant_ukom_id}`,
            )
            .subscribe({
                next: (response: DataDokumenUkom[]) => {
                    this.dataDokumenUkom = response
                    this.mapDokumenUkom()
                },
                error: (error) => {
                    console.log(error)
                },
            })
    }

    getGroupedCompetencies(): any[] {
        if (!this.scoreMap['CAT'].kompetensiIndikatorDtoList) {
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

    deleteExamScore(exam_grade_id: string): void {
        const deleteAction = () => {
            this.isDeleteExamScoreLoading$.next(true)
            this.apiService
                .deleteData(`/api/v1/exam_grade/${exam_grade_id}`)
                .pipe(
                    catchError((error) => {
                        console.error('Failed to delete exam score:', error)
                        this.handlerService.handleAlert(
                            'Error',
                            'Gagal menghapus nilai ujian',
                        )
                        return EMPTY
                    }),
                    finalize(() => {
                        this.isDeleteExamScoreLoading$.next(false)
                    }),
                )
                .subscribe({
                    next: () => {
                        this.handlerService.handleAlert(
                            'Success',
                            'Nilai ujian berhasil dihapus',
                        )
                        this.loadInitialDataFlow()
                    },
                    error: (err) => {
                        console.error('Unhandled error in subscribe:', err)
                    },
                })
        }

        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                deleteAction()
            },
        })
    }

    toggleUpdatePasswordModal() {
        this.isToggleUpdatePasswordModal$.next(
            !this.isToggleUpdatePasswordModal$.value,
        )
    }
}
