import { Component, inject } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import {
    BehaviorSubject,
    catchError,
    combineLatest,
    EMPTY,
    finalize,
    forkJoin,
    map,
    Observable,
    of,
    switchMap,
    tap,
} from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
// import { CATScore } from '@/modules/ukom/models/cat/cat-score'
import {
    CATScore,
    MakalahScore,
} from '@/modules/ukom/models/exam/exam-score.model'

import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { DataDokumenUkom } from '@/modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { ExamType } from '@/modules/ukom/models/exam-type.model'
import { HandlerService } from '@/modules/base/services/handler.service'
// import { MakalahScore } from '@/modules/ukom/models/cat/makalah-score'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
import { ForcePasswordFormComponent } from '@/modules/base/components/force-password-form/force-password-form.component'
import { PredikatKinerjaService } from '@/modules/maintenance/services/predikat-kinerja.service'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { ExamGradeService } from '@/modules/ukom/services/exam-grade.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ProvinsiService } from '@/modules/maintenance/services/provinsi.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { ScoreValue } from '@/modules/ukom/models/cat/score-value.type'

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
    ],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss',
})
export class UkomTaskDetailComponent {
    router = inject(Router)
    location = inject(Location)
    jenisUkomService = inject(JenisUkomService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    examGradeService = inject(ExamGradeService)
    participantService = inject(UkomParticipantService)
    predikatKinerjaService = inject(PredikatKinerjaService)
    provinsiService = inject(ProvinsiService)
    kabkotaService = inject(KabKotaService)
    bidangJabatanService = inject(BidangJabatanService)

    participantId: string
    dataDokumenUkom: DataDokumenUkom[] = []

    participant = new Participant()
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

    scoreMap: Record<string, ScoreValue | null> = {}
    selectedExamId: string | null = null

    isLoading$: Observable<boolean>

    isDeleteExamScoreLoading$ = new BehaviorSubject<boolean>(false)

    isToggleUpdatePasswordModal$ = new BehaviorSubject<boolean>(false)
    constructor(
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private filePreviewService: FilePreviewService,
        private confirmationService: ConfirmationService,
        public pendidikanService: PendidikanService,
    ) {
        this.isLoading$ = combineLatest([this.ukomDetailLoading$]).pipe(
            map((loadings) => loadings.some((isLoading) => isLoading)),
        )
    }

    ngOnInit() {
        this.pendidikanService.fetchPendidikan()
        this.activatedRoute.paramMap.subscribe((params) => {
            this.participantId = params.get('id')
            this.getParticipantUkomDetail()
            this.getDokumenUkomList()
        })
    }

    getAllScores(participant: Participant) {
        const requests = participant.roomUkomDto.examScheduleDtoList.map(
            (examSchedule) => {
                return this.examGradeService
                    .getExamGradeByExamScheduleIdAndParticipantId(
                        examSchedule.id,
                        participant.id,
                    )
                    .pipe(
                        catchError((err) => {
                            if (err.status === 404) {
                                return of(null)
                            }

                            return of(null)
                        }),
                        map((response) => {
                            let scoreInstance: ScoreValue | null = null
                            if (response) {
                                switch (examSchedule.examTypeCode) {
                                    case 'CAT':
                                        scoreInstance = new CATScore(response)
                                        break
                                    case 'MAKALAH':
                                        scoreInstance = new MakalahScore(
                                            response,
                                        )
                                        break
                                    default:
                                        scoreInstance = response
                                }
                            }

                            return { examSchedule, scoreInstance }
                        }),
                    )
            },
        )
        return forkJoin(requests)
            .pipe(
                tap((results) => {
                    results.forEach((result) => {
                        if (result?.examSchedule?.id) {
                            this.scoreMap[result.examSchedule.id] =
                                result.scoreInstance
                        }
                    })
                    console.log(this.scoreMap)
                }),
            )
            .subscribe()
    }

    assignPendidikanName(pendidikanCode: string) {
        this.pendidikanName =
            this.pendidikanService.getPendidikanById(pendidikanCode)?.name ||
            '-'
    }

    assignBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.bidangJabatanService.findByCode(bidangJabatanCode).subscribe({
            next: (response) => {
                this.bidangJabatanName = response.name ?? null
            },
        })
    }

    assignProvinsiNameByCode(provinsiCode: string) {
        this.provinsiService.findById(provinsiCode).subscribe({
            next: (response) => {
                this.provinsiName = response.name ?? null
            },
        })
    }

    assignKabupatenNameByCode(kabupatenCode: string) {
        this.kabkotaService.findById(kabupatenCode).subscribe({
            next: (response) => {
                this.kabupatenName = response.name ?? null
                this.typeKabKota = response.type ?? null
            },
        })
    }

    assignPredikat1ById(predikatId: string) {
        this.predikatKinerjaService.findById(predikatId).subscribe({
            next: (response) => {
                this.predikat1Name = response.name ?? null
            },
        })
    }

    assignPredikat2ById(predikatId: string) {
        this.predikatKinerjaService.findById(predikatId).subscribe({
            next: (response) => {
                this.predikat2Name = response.name ?? null
            },
        })
    }

    getScoreByExamId(examId: string): ScoreValue | null {
        return this.scoreMap[examId] || null
    }

    hasNonNullScores(): boolean {
        return Object.values(this.scoreMap).some(
            (score) => score !== null && score !== undefined,
        )
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

    toggleModal(examId?: string) {
        if (examId !== undefined) {
            this.selectedExamId = examId
        }
        this.isModalOpen$.next(!this.isModalOpen$.value)
        if (!this.isModalOpen$.value) {
            this.selectedExamId = null
        }
    }

    getUnitKerjaById(unitKerjaId: string) {
        this.apiService.getData(`/api/v1/unit_kerja/${unitKerjaId}`).subscribe({
            next: (response: any) => {
                this.unitKerjaName = response.name
            },
        })
    }

    assignPendidikanNameByCode(pendidikanCode: string) {
        this.pendidikanName =
            this.pendidikanService.getPendidikanById(pendidikanCode)?.name ||
            '-'
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }

    viewFile(examId: string) {
        const makalahScore = this.scoreMap[examId] as MakalahScore
        const answerDto = makalahScore?.questionDtoList?.[0]?.answerDto

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
        this.ukomDetailLoading$.next(true)
        this.participantService
            .getParticipantByParticipantId(this.participantId)
            .pipe(
                switchMap((participant) => {
                    return this.participantService.getParticipantUkom(
                        participant.nip,
                    )
                }),
                finalize(() => {
                    this.ukomDetailLoading$.next(false)
                }),
            )
            .subscribe({
                next: (participant) => {
                    this.participant = participant
                    if (!participant.unitKerjaName) {
                        this.getUnitKerjaById(participant.unitKerjaId)
                    }
                    this.assignPendidikanNameByCode(
                        participant.pendidikanTerakhirCode,
                    )

                    if (participant.provinsiId) {
                        this.assignProvinsiNameByCode(participant.provinsiId)
                    }

                    if (participant.kabupatenKotaId) {
                        this.assignKabupatenNameByCode(
                            participant.kabupatenKotaId,
                        )
                    }

                    if (participant.bidangJabatanCode) {
                        this.assignBidangjabatanNameByCode(
                            participant.bidangJabatanCode,
                        )
                    }

                    if (participant.predikatKinerja1Id) {
                        this.assignPredikat1ById(participant.predikatKinerja1Id)
                    }

                    if (participant.predikatKinerja2Id) {
                        this.assignPredikat2ById(participant.predikatKinerja2Id)
                    }

                    if (participant.predikatKinerja1Name) {
                        this.predikat1Name = participant.predikatKinerja1Name
                    } else {
                        this.assignPredikat1ById(participant.predikatKinerja1Id)
                    }

                    if (participant.predikatKinerja2Name) {
                        this.predikat2Name = participant.predikatKinerja2Name
                    } else {
                        this.assignPredikat2ById(participant.predikatKinerja2Id)
                    }

                    this.getAllScores(participant)
                },
                error: (err) => {
                    console.log(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data peserta UKOM.',
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

    getDokumenUkomList() {
        this.apiService
            .getData(`/api/v1/document_ukom/participant/${this.participantId}`)
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
        if (!this.selectedExamId) {
            return []
        }

        const catScore = this.scoreMap[this.selectedExamId] as CATScore
        if (!catScore?.kompetensiIndikatorDtoList) {
            return []
        }

        // Group by kompetensiId
        const grouped = catScore.kompetensiIndikatorDtoList.reduce(
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
                        this.getParticipantUkomDetail()
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
