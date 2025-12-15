import { Component, inject, Input, SimpleChanges } from '@angular/core'
import { IndikatorKompetensiUkom } from '@/modules/ukom/models/indikator-kompetensi'
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    forkJoin,
    map,
    Observable,
    switchMap,
} from 'rxjs'
import { UkomQuestion } from '@/modules/ukom/models/ukom-question'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { CommonModule } from '@angular/common'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { FormsModule } from '@angular/forms'
import { UkomRoomService } from '@/modules/ukom/services/ukom-room.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'

@Component({
    selector: 'app-ukom-exam-cat-deprecated',
    standalone: true,
    imports: [
        CommonModule,
        ModalComponent,
        FormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-exam-cat.component.deprecated.html',
    styleUrl: './ukom-exam-cat.component.deprecated.scss',
})
export class UkomExamCatDeprecatedComponent {
    @Input() roomUkomDetail: RoomUkomDetail
    @Input() examDetail: ExamSchedule

    ukomRoomService = inject(UkomRoomService)
    IndikatorKompetensiUkom: IndikatorKompetensiUkom[] = []
    groupedIndicators: Map<string, IndikatorKompetensiUkom[]> = new Map()
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    listQuestion$: Observable<UkomQuestion[]>
    filteredQuestions$: Observable<UkomQuestion[]>
    questCheckedList: UkomQuestion[] = []
    submitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )

    filterText: string = ''
    private searchSubject = new BehaviorSubject<string>('')
    listSavedQuestion: UkomQuestion[] = []

    randomCount: number = 0
    allAvailableQuestions: UkomQuestion[] = []

    currentIndicatorId: string = ''
    randomCountPerIndicator: number = 0
    currentIndicatorQuestions: UkomQuestion[] = []

    payload = {
        id: '',
        exam_type_code: '',
        question_id_list: [''],
    }

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
            forkJoin({
                indicators: this.fetchIndikatorKompetensi(this.roomUkomDetail),
                questions:
                    this.ukomRoomService.searchQuestionOfRoomUkomByExamTypeCode(
                        this.examDetail.examTypeCode,
                        this.roomUkomDetail.id,
                        1000,
                    ),
            }).subscribe({
                next: ({ indicators, questions }) => {
                    this.IndikatorKompetensiUkom = indicators
                    this.listSavedQuestion = questions.data || []
                    this.questCheckedList = [...this.listSavedQuestion]
                    this.groupIndicators()
                },
                error: () => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data indikator kompetensi atau pertanyaan',
                    )
                },
            })
        }
    }

    groupIndicators() {
        this.groupedIndicators.clear()
        this.IndikatorKompetensiUkom.forEach((indicator) => {
            const competencyName = indicator.kompetensi?.name || 'Lainnya'
            if (!this.groupedIndicators.has(competencyName)) {
                this.groupedIndicators.set(competencyName, [])
            }
            this.groupedIndicators.get(competencyName)!.push(indicator)
        })
    }

    getQuestionCountForIndicator(indicatorId: string): number {
        return this.questCheckedList.filter(
            (q) => q.questionGroup?.associationId === indicatorId,
        ).length
    }

    toArray(keys: IterableIterator<string>) {
        return Array.from(keys)
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

    getDropDownQuestionList(competencyIndicatorId: string) {
        const type = 'MULTI_CHOICE'

        this.listQuestion$ = this.apiService
            .getData(
                `/api/v1/question/droplist?association_id=${competencyIndicatorId}&module_id=${this.examDetail.examTypeCode}&type=${type}`,
            )
            .pipe(
                map((response) =>
                    response.map((question: UkomQuestion) => {
                        const q = new UkomQuestion(question)
                        if (!q.questionGroup) {
                            q.questionGroup = {
                                associationId: competencyIndicatorId,
                            } as any
                        } else {
                            q.questionGroup.associationId =
                                competencyIndicatorId
                        }
                        return q
                    }),
                ),
            )

        this.filteredQuestions$ = this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((search) =>
                this.listQuestion$.pipe(
                    map((questions) =>
                        questions.filter((q) =>
                            q.question
                                .toLowerCase()
                                .includes(search.toLowerCase()),
                        ),
                    ),
                ),
            ),
        )

        this.listQuestion$.subscribe((questions) => {
            this.currentIndicatorQuestions = questions
        })
    }

    onSearchChange(search: string) {
        this.searchSubject.next(search)
    }

    toggleModal(indikator_kompetensi_id?: string) {
        if (indikator_kompetensi_id) {
            this.openModal(indikator_kompetensi_id)
        } else {
            this.isModalOpen$.next(!this.isModalOpen$.value)
            this.currentIndicatorId = ''
            this.randomCountPerIndicator = 0
            this.currentIndicatorQuestions = []
        }
    }

    onQuestionSelect(question: UkomQuestion) {
        if (question.checked) {
            if (!this.questCheckedList.some((q) => q.id === question.id)) {
                this.questCheckedList = [...this.questCheckedList, question]
                this.listQuestion$ = this.listQuestion$.pipe(
                    map((questions) => {
                        return questions.map((q: UkomQuestion) => {
                            if (q.id === question.id) {
                                q.checked = true
                            }
                            return q
                        })
                    }),
                )
            }
        } else {
            const index = this.questCheckedList.findIndex(
                (q) => q.id === question.id,
            )
            if (index > -1) {
                this.questCheckedList = [
                    ...this.questCheckedList.slice(0, index),
                    ...this.questCheckedList.slice(index + 1),
                ]
                this.listQuestion$ = this.listQuestion$.pipe(
                    map((questions) => {
                        return questions.map((q: UkomQuestion) => {
                            if (q.id === question.id) {
                                q.checked = false
                            }
                            return q
                        })
                    }),
                )
            }
        }
    }

    updateCheckedState() {
        this.filteredQuestions$ = this.filteredQuestions$.pipe(
            map((questions) => {
                return questions.map((question: UkomQuestion) => {
                    question.checked = this.questCheckedList.some(
                        (q) => q.id === question.id,
                    )
                    return question
                })
            }),
        )
    }

    getListPertanyaan() {
        this.apiService
            .postData(
                `/api/v1/room_ukom/search/${this.examDetail.examTypeCode}/${this.roomUkomDetail.id}?limit=1000`,
                {},
            )
            .subscribe({
                next: (res: any) => {
                    this.listSavedQuestion = res.data || []
                    // Merge saved questions with current selection
                    this.questCheckedList = [...this.listSavedQuestion]
                },
            })
    }

    openModal(indikator_kompetensi_id: string) {
        this.currentIndicatorId = indikator_kompetensi_id
        this.randomCountPerIndicator = 0

        this.getDropDownQuestionList(indikator_kompetensi_id)
        this.updateCheckedState()
        this.isModalOpen$.next(true)
    }

    selectRandomQuestionsFromCurrentIndicator() {
        if (this.randomCountPerIndicator <= 0) {
            this.handlerService.handleAlert(
                'Warning',
                'Masukkan jumlah pertanyaan yang valid',
            )
            return
        }

        const availableQuestions = this.currentIndicatorQuestions.filter(
            (q) =>
                !this.questCheckedList.some((selected) => selected.id === q.id),
        )

        if (this.randomCountPerIndicator > availableQuestions.length) {
            this.handlerService.handleAlert(
                'Warning',
                `Hanya tersedia ${availableQuestions.length} pertanyaan yang belum dipilih dari indikator ini`,
            )
            return
        }

        const shuffled = [...availableQuestions]

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        const selectedQuestions = shuffled.slice(
            0,
            this.randomCountPerIndicator,
        )

        selectedQuestions.forEach((question) => {
            question.checked = true
        })

        this.questCheckedList = [...this.questCheckedList, ...selectedQuestions]

        this.listQuestion$ = this.listQuestion$.pipe(
            map((questions) => {
                return questions.map((q: UkomQuestion) => {
                    const isSelected = selectedQuestions.some(
                        (selected) => selected.id === q.id,
                    )
                    if (isSelected) {
                        q.checked = true
                    }
                    return q
                })
            }),
        )

        this.updateCheckedState()

        this.handlerService.handleAlert(
            'Success',
            `Berhasil memilih ${selectedQuestions.length} pertanyaan secara acak dari indikator ini`,
        )
        this.randomCountPerIndicator = 0
    }

    clearCurrentIndicatorSelection() {
        const currentIndicatorCheckedQuestions = this.questCheckedList.filter(
            (checkedQ) =>
                this.currentIndicatorQuestions.some(
                    (currQ) => currQ.id === checkedQ.id,
                ),
        )
        if (currentIndicatorCheckedQuestions.length === 0) {
            this.handlerService.handleAlert(
                'Info',
                'Tidak ada pertanyaan yang dipilih dari indikator ini',
            )
            return
        }
        this.questCheckedList = this.questCheckedList.filter(
            (checkedQ) =>
                !this.currentIndicatorQuestions.some(
                    (currQ) => currQ.id === checkedQ.id,
                ),
        )

        this.listQuestion$ = this.listQuestion$.pipe(
            map((questions) => {
                return questions.map((q: UkomQuestion) => {
                    q.checked = false
                    return q
                })
            }),
        )

        this.updateCheckedState()
        this.handlerService.handleAlert(
            'Success',
            `Berhasil membersihkan ${currentIndicatorCheckedQuestions.length} pertanyaan dari indikator ini`,
        )
    }

    loadAllQuestionsFromAllIndikator() {
        const type = 'MULTI_CHOICE'

        this.allAvailableQuestions = []

        const loadPromises = this.IndikatorKompetensiUkom.map((indikator) => {
            return this.apiService
                .getData(
                    `/api/v1/question/droplist?association_id=${indikator.id}&module_id=${this.examDetail.examTypeCode}&type=${type}`,
                )
                .toPromise()
                .then((response) => {
                    const questions = response.map((question: any) => {
                        const q = new UkomQuestion(question)
                        if (!q.questionGroup) {
                            q.questionGroup = {
                                associationId: indikator.id,
                            } as any
                        } else {
                            q.questionGroup.associationId = indikator.id
                        }
                        return q
                    })
                    this.allAvailableQuestions.push(...questions)
                })
                .catch((err) => {
                    console.error(
                        `Error loading questions for indikator ${indikator.id}:`,
                        err,
                    )
                })
        })

        return Promise.all(loadPromises)
    }

    async selectRandomQuestionsFromAll() {
        if (this.randomCount <= 0) {
            this.handlerService.handleAlert(
                'Warning',
                'Masukkan jumlah pertanyaan yang valid',
            )
            return
        }

        try {
            await this.loadAllQuestionsFromAllIndikator()

            const availableQuestions = this.allAvailableQuestions.filter(
                (q) =>
                    !this.questCheckedList.some(
                        (selected) => selected.id === q.id,
                    ),
            )

            if (this.randomCount > availableQuestions.length) {
                this.handlerService.handleAlert(
                    'Warning',
                    `Hanya tersedia ${availableQuestions.length} pertanyaan yang belum dipilih dari semua kompetensi`,
                )
                return
            }

            // Fisher-Yates shuffle algorithm for random selection
            const shuffled = [...availableQuestions]
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }

            // Select the first 'randomCount' questions
            const selectedQuestions = shuffled.slice(0, this.randomCount)

            // Add selected questions to checked list
            this.questCheckedList = [
                ...this.questCheckedList,
                ...selectedQuestions,
            ]

            this.handlerService.handleAlert(
                'Success',
                `Berhasil memilih ${selectedQuestions.length} pertanyaan secara acak dari semua kompetensi`,
            )

            this.randomCount = 0
        } catch (error) {
            console.error('Error during random selection:', error)
            this.handlerService.handleAlert(
                'Error',
                'Gagal melakukan pemilihan acak',
            )
        }
    }

    clearAllSelection() {
        this.questCheckedList = []
        this.handlerService.handleAlert(
            'Success',
            'Semua pilihan pertanyaan telah dibersihkan',
        )
    }

    submit() {
        this.payload.id = this.roomUkomDetail.id
        this.payload.exam_type_code = this.examDetail.examTypeCode
        this.payload.question_id_list = this.questCheckedList.map((q) => q.id)

        this.confirmationService.open(false).subscribe({
            next: (res: any) => {
                if (!res.confirmed) return

                this.submitLoading$.next(true)

                this.apiService
                    .postData('/api/v1/room_ukom/question', this.payload)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan pertanyaan',
                            )
                            this.getListPertanyaan()
                            this.submitLoading$.next(false)
                        },
                        error: (err: any) => {
                            console.error('Error:', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan pertanyaan',
                            )
                            this.submitLoading$.next(false)
                        },
                    })
            },
            error: (err: any) => {
                console.error('Error:', err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal menambahkan pertanyaan',
                )
                this.submitLoading$.next(false)
            },
        })
    }
}
