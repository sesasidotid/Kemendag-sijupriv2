import { HandlerService } from '@/modules/base/services/handler.service'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import {
    Component,
    inject,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    BehaviorSubject,
    catchError,
    finalize,
    forkJoin,
    Observable,
    of,
} from 'rxjs'
import { FormsModule } from '@angular/forms'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { ApiService } from '@/modules/base/services/api.service'
import { IndikatorKompetensiUkom } from '@/modules/ukom/models/indikator-kompetensi'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ExamConfigService } from '@/modules/ukom/services/exam-config.service'
import { ExamConfigRequest } from '@/modules/ukom/models/exam-config/exam-config-request.model'
import { ExamConfigModel } from '@/modules/ukom/models/exam-config/exam-config.model'
import { map } from 'rxjs/operators'

@Component({
    selector: 'app-ukom-exam-cat',
    standalone: true,
    imports: [CommonModule, FormsModule, LoadingButtonComponent],
    templateUrl: './ukom-exam-cat.component.html',
    styleUrl: './ukom-exam-cat.component.scss',
})
export class UkomExamCatComponent implements OnChanges {
    @Input() roomUkomDetail: RoomUkomDetail
    @Input() examDetail: ExamSchedule

    examConfigService = inject(ExamConfigService)
    IndikatorKompetensiUkom: IndikatorKompetensiUkom[] = []
    groupedIndicators: Map<string, IndikatorKompetensiUkom[]> = new Map()
    submitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )

    indicatorQuestionCounts: Map<string, number> = new Map()
    indicatorAvailableQuestions: Map<string, number> = new Map()

    targetRandomCount: number | null = null

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes['roomUkomDetail'] || changes['examDetail']) &&
            this.roomUkomDetail &&
            this.examDetail
        ) {
            this.fetchIndikatorKompetensi(this.roomUkomDetail).subscribe({
                next: (indicators) => {
                    this.IndikatorKompetensiUkom = indicators
                    this.initializeQuestionCounts()
                    this.fetchAvailableQuestionsCount()
                    // Fetch existing config and pre-fill counts
                    this.fetchExistingExamConfig()
                },
                error: () => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data indikator kompetensi',
                    )
                },
            })
        }
    }

    groupIndicators() {
        this.groupedIndicators.clear()
        this.IndikatorKompetensiUkom.forEach((indicator) => {
            if (this.getAvailableQuestionCount(indicator.id) > 0) {
                const competencyName = indicator.kompetensi?.name || 'Lainnya'
                if (!this.groupedIndicators.has(competencyName)) {
                    this.groupedIndicators.set(competencyName, [])
                }
                this.groupedIndicators.get(competencyName)!.push(indicator)
            }
        })
    }

    initializeQuestionCounts() {
        this.IndikatorKompetensiUkom.forEach((indicator) => {
            if (!this.indicatorQuestionCounts.has(indicator.id)) {
                this.indicatorQuestionCounts.set(indicator.id, 0)
            }
        })
    }

    getQuestionCount(indicatorId: string): number {
        return this.indicatorQuestionCounts.get(indicatorId) || 0
    }

    setQuestionCount(indicatorId: string, count: string) {
        let parsedCount = parseInt(count, 10)

        // handle NaN and negative values
        if (isNaN(parsedCount) || parsedCount < 0) {
            parsedCount = 0
        }

        // validate against available questions
        const available = this.getAvailableQuestionCount(indicatorId)
        if (parsedCount > available) {
            parsedCount = available
            this.handlerService.handleAlert(
                'Warning',
                `Maksimal ${available} pertanyaan tersedia untuk indikator ini`,
            )
        }

        // store as number
        this.indicatorQuestionCounts.set(indicatorId, parsedCount)
    }

    getAvailableQuestionCount(indicatorId: string): number {
        return this.indicatorAvailableQuestions.get(indicatorId) || 0
    }

    fetchAvailableQuestionsCount() {
        const type = 'MULTI_CHOICE'
        const requests = this.IndikatorKompetensiUkom.map((indikator) => {
            const url = `/api/v1/question/droplist?association_id=${indikator.id}&module_id=${this.examDetail.examTypeCode}&type=${type}`
            return this.apiService.getData(url).pipe(
                map((res) => res || []),
                catchError(() => of([])),
            )
        })

        forkJoin(requests)
            .pipe()
            .subscribe({
                next: (results: any[]) => {
                    results.forEach((questions, index) => {
                        const indicatorId =
                            this.IndikatorKompetensiUkom[index].id
                        this.indicatorAvailableQuestions.set(
                            indicatorId,
                            questions.length,
                        )
                    })
                    this.groupIndicators()
                },
                error: (err) => {
                    console.error('Error fetching available questions:', err)
                },
            })
    }

    getTotalQuestionCount(): number {
        let total = 0
        this.indicatorQuestionCounts.forEach((count) => {
            total += count
        })
        return total
    }

    toArray(keys: IterableIterator<string>) {
        return Array.from(keys)
    }

    clearAllSelection() {
        this.indicatorQuestionCounts.clear()
        this.initializeQuestionCounts()
        this.handlerService.handleAlert(
            'Success',
            'Semua jumlah pertanyaan telah direset',
        )
    }

    randomizeAll() {
        if (!this.targetRandomCount || this.targetRandomCount < 1) {
            this.handlerService.handleAlert(
                'Warning',
                'Masukkan target jumlah total soal yang diinginkan dengan benar',
            )
            return
        }

        let totalAvailable = 0
        const availablePerIndicator: {
            id: string
            available: number
            current: number
        }[] = []

        this.IndikatorKompetensiUkom.forEach((indicator) => {
            const available = this.getAvailableQuestionCount(indicator.id)
            totalAvailable += available
            if (available > 0) {
                availablePerIndicator.push({
                    id: indicator.id,
                    available,
                    current: 0,
                })
            }
            this.indicatorQuestionCounts.set(indicator.id, 0)
        })

        if (this.targetRandomCount > totalAvailable) {
            this.handlerService.handleAlert(
                'Warning',
                `Maksimal total soal yang tersedia adalah ${totalAvailable}`,
            )
            return
        }

        let remainingTarget = this.targetRandomCount

        while (remainingTarget > 0) {
            const validIndicators = availablePerIndicator.filter(
                (ind) => ind.current < ind.available,
            )
            if (validIndicators.length === 0) break

            const randomIndex = Math.floor(
                Math.random() * validIndicators.length,
            )
            validIndicators[randomIndex].current += 1
            remainingTarget--
        }

        availablePerIndicator.forEach((ind) => {
            if (ind.current > 0) {
                this.indicatorQuestionCounts.set(ind.id, ind.current)
            }
        })

        this.handlerService.handleAlert(
            'Success',
            'Jumlah pertanyaan berhasil diacak sesuai target',
        )
    }

    submit() {
        // Validate that at least one indicator has questions
        const totalQuestions = this.getTotalQuestionCount()
        if (totalQuestions === 0) {
            this.handlerService.handleAlert(
                'Warning',
                'Mohon masukkan jumlah pertanyaan untuk setidaknya satu indikator',
            )
            return
        }

        // Build the payload
        const examShuffleConfigurationDtoList: Array<{
            numOfQuestion: number
            kompetensiIndikatorId: string
        }> = []
        this.indicatorQuestionCounts.forEach((count, indicatorId) => {
            if (count > 0) {
                examShuffleConfigurationDtoList.push({
                    numOfQuestion: count,
                    kompetensiIndikatorId: indicatorId,
                })
            }
        })

        const payload = new ExamConfigRequest({
            examScheduleId: this.examDetail.id,
            examShuffleConfigurationDtoList: examShuffleConfigurationDtoList,
        })

        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) return

                this.submitLoading$.next(true)

                this.examConfigService
                    .shuffleCATQuestion(payload)
                    .pipe(
                        finalize(() => {
                            this.submitLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Pertanyaan berhasil dikonfigurasi dan di-shuffle',
                            )
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengkonfigurasi pertanyaan',
                            )
                        },
                    })
            },
        })
    }

    private fetchIndikatorKompetensi(
        detail: RoomUkomDetail,
    ): Observable<IndikatorKompetensiUkom[]> {
        const { jabatanCode, jenjangCode, bidangJabatanCode } = detail

        const params = new URLSearchParams()
        if (jabatanCode) params.append('jabatanCode', jabatanCode)
        if (jenjangCode) params.append('jenjangCode', jenjangCode)
        if (bidangJabatanCode)
            params.append('bidangJabatanCode', bidangJabatanCode)

        const queryString = params.toString()
        const url = `/api/v1/kompetensi_indikator/droplist${
            queryString ? '?' + queryString : ''
        }`

        return this.apiService.getData(url)
    }

    private fetchExistingExamConfig(): void {
        const url = `/api/v1/exam_config/exam_schedule/${this.examDetail.id}`

        this.apiService.getData(url).subscribe({
            next: (config: ExamConfigModel) => {
                if (
                    config &&
                    config.examShuffleConfigurationDtoList &&
                    config.examShuffleConfigurationDtoList.length > 0
                ) {
                    // Config exists, pre-fill the question counts
                    this.preFillQuestionCounts(config)
                }
            },
            error: (err) => {
                console.error(err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil konfigurasi ujian yang ada',
                )
            },
        })
    }

    private preFillQuestionCounts(config: ExamConfigModel): void {
        config.examShuffleConfigurationDtoList.forEach((item) => {
            this.indicatorQuestionCounts.set(
                item.kompetensiIndikatorId,
                item.numOfQuestion,
            )
        })
    }
}
