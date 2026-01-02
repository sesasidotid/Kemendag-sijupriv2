import { IndikatorKompetensiUkom } from '@/modules/ukom/models/indikator-kompetensi'
import { KompetensiUkom } from '@/modules/ukom/models/kompetensi'
import { Component, OnInit } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { BehaviorSubject, combineLatest, map, Observable, take } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { ActivatedRoute } from '@angular/router'
import { HandlerService } from '@/modules/base/services/handler.service'
import { UkomQuestion } from '@/modules/ukom/models/ukom-question'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

@Component({
    selector: 'app-ukom-indikator-kompetensi-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ukom-indikator-kompetensi-detail.component.html',
    styleUrl: './ukom-indikator-kompetensi-detail.component.scss',
})
export class UkomIndikatorKompetensiDetailComponent implements OnInit {
    isLoading$: Observable<boolean>
    detailIndikatorKompetensi: IndikatorKompetensiUkom =
        new IndikatorKompetensiUkom()
    detailKompetensi: KompetensiUkom = new KompetensiUkom()
    questionsGroupedByModule: Map<string, UkomQuestion[]> = new Map()
    moduleTypes: string[] = [
        ExamTypeCategory.CAT,
        ExamTypeCategory.WAWANCARA,
        ExamTypeCategory.SEMINAR,
        ExamTypeCategory.PRAKTIK,
        ExamTypeCategory.MAKALAH,
        ExamTypeCategory.PORTOFOLIO,
        ExamTypeCategory.STUDI_KASUS,
    ]
    private isIndikatorKompetensiLoading$ = new BehaviorSubject<boolean>(false)
    private isKompetensiLoading$ = new BehaviorSubject<boolean>(false)
    private isQuestionLoading$ = new BehaviorSubject<boolean>(false)

    constructor(
        private location: Location,
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {
        this.isLoading$ = combineLatest([
            this.isIndikatorKompetensiLoading$,
            this.isKompetensiLoading$,
            this.isQuestionLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit(): void {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe((params) => {
            const indikatorId = params.get('id')
            const kompetensiId = params.get('kompetensi_id')

            if (indikatorId) {
                this.getIndikatorKompetensiDetail(indikatorId)
                this.getQuestionList(indikatorId)
            } else {
                this.handlerService.handleAlert(
                    'Error',
                    'ID Indikator tidak ditemukan.',
                )
                this.onBack()
            }

            if (kompetensiId) {
                this.getKompetensiDetail(kompetensiId)
            } else {
                this.handlerService.handleAlert(
                    'Error',
                    'ID Kompetensi tidak ditemukan.',
                )
            }
        })
    }

    onBack(): void {
        this.location.back()
    }

    getIndikatorKompetensiDetail(id: string): void {
        this.isIndikatorKompetensiLoading$.next(true)
        this.apiService
            .getData(`/api/v1/kompetensi_indikator/${id}`)
            .subscribe({
                next: (res: any) => {
                    this.detailIndikatorKompetensi =
                        new IndikatorKompetensiUkom(res)
                    this.isIndikatorKompetensiLoading$.next(false)
                },
                error: (err) => {
                    console.error('Error fetching Indikator Kompetensi:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data indikator kompetensi',
                    )
                    this.isIndikatorKompetensiLoading$.next(false)
                },
            })
    }

    getKompetensiDetail(id: string): void {
        this.isKompetensiLoading$.next(true)
        this.apiService.getData(`/api/v1/kompetensi/${id}`).subscribe({
            next: (res: any) => {
                this.detailKompetensi = new KompetensiUkom(res)
                this.isKompetensiLoading$.next(false)
            },
            error: (err) => {
                console.error('Error fetching Kompetensi:', err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data kompetensi',
                )
                this.isKompetensiLoading$.next(false)
            },
        })
    }

    getQuestionList(indikatorId: string): void {
        this.isQuestionLoading$.next(true)
        this.questionsGroupedByModule.clear()

        const params = new URLSearchParams()
        params.append('association_id', indikatorId)
        const queryString = params.toString()

        const url = `/api/v1/question/droplist${
            queryString ? '?' + queryString : ''
        }`

        this.apiService.getData(url).subscribe({
            next: (result: UkomQuestion[]) => {
                // Group questions by module_id
                result.forEach((question) => {
                    const moduleId = question.moduleId || 'UNKNOWN'
                    if (!this.questionsGroupedByModule.has(moduleId)) {
                        this.questionsGroupedByModule.set(moduleId, [])
                    }
                    this.questionsGroupedByModule.get(moduleId)!.push(question)
                })
                this.isQuestionLoading$.next(false)
            },
            error: (error: any) => {
                console.error('Error fetching Questions:', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data pertanyaan',
                )
                this.isQuestionLoading$.next(false)
            },
        })
    }

    deleteQuestion(question_id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.apiService
                    .deleteData(`/api/v1/question/${question_id}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus pertanyaan',
                            )
                            this.getQuestionList(
                                this.detailIndikatorKompetensi.id,
                            )
                        },
                        error: (error: any) => {
                            console.error('Error deleting question:', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus pertanyaan',
                            )
                        },
                    })
            },
        })
    }

    getQuestionsForModule(moduleType: string): UkomQuestion[] {
        return this.questionsGroupedByModule.get(moduleType) || []
    }

    getTotalQuestions(): number {
        let total = 0
        this.questionsGroupedByModule.forEach((questions) => {
            total += questions.length
        })
        return total
    }

    getModuleDisplayName(moduleType: string): string {
        const displayNames: { [key: string]: string } = {
            [ExamTypeCategory.CAT]: 'CAT',
            [ExamTypeCategory.WAWANCARA]: 'Wawancara',
            [ExamTypeCategory.SEMINAR]: 'Seminar',
            [ExamTypeCategory.PRAKTIK]: 'Praktik',
            [ExamTypeCategory.MAKALAH]: 'Makalah',
            [ExamTypeCategory.PORTOFOLIO]: 'Portofolio',
            [ExamTypeCategory.STUDI_KASUS]: 'Studi Kasus',
        }
        return displayNames[moduleType] || moduleType
    }

    getQuestionTypeBadgeClass(type: string): string {
        const badgeClasses: { [key: string]: string } = {
            MULTI_CHOICE: 'badge bg-primary',
            ESSAY: 'badge bg-info',
            TRUE_FALSE: 'badge bg-success',
            SHORT_ANSWER: 'badge bg-warning',
        }
        return badgeClasses[type] || 'badge bg-secondary'
    }

    getQuestionTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            MULTI_CHOICE: 'Pilihan Ganda',
            ESSAY: 'Essay',
            TRUE_FALSE: 'Benar/Salah',
            SHORT_ANSWER: 'Jawaban Singkat',
        }
        return labels[type] || type
    }
}
