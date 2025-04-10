import { HandlerService } from './../../../../modules/base/services/handler.service'
import { RoomUkomDetail } from './../../../../modules/ukom/models/room-ukom-detail'
import { Component } from '@angular/core'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ActivatedRoute } from '@angular/router'
import { ExamDetail } from '../../../../modules/ukom/models/exam_detail'
import { UkomRoomKompetensi } from '../../../../modules/ukom/models/ukom-room-kompetensi'
import { UkomQuestion } from '../../../../modules/ukom/models/ukom-question'
import { CommonModule } from '@angular/common'
import { Observable } from 'rxjs'
import {
    map,
    debounceTime,
    distinctUntilChanged,
    switchMap
} from 'rxjs/operators'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { BehaviorSubject } from 'rxjs'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { first } from 'rxjs/operators';

@Component({
    selector: 'app-ukom-exam-choose-comp-questions',
    standalone: true,
    imports: [CommonModule, ModalComponent, FormsModule],
    templateUrl: './ukom-exam-choose-comp-questions.component.html',
    styleUrl: './ukom-exam-choose-comp-questions.component.scss'
})
export class UkomExamChooseCompQuestionsComponent {
    RoomUkomDetail: RoomUkomDetail = new RoomUkomDetail()
    ExamDetail: ExamDetail = new ExamDetail()
    UkomRoomKompetensi: UkomRoomKompetensi[] = []
    room_ukom_id: string
    type_ukom: string

    isModalOpen$ = new BehaviorSubject<boolean>(false)
    listQuestion$: Observable<UkomQuestion[]>
    filteredQuestions$: Observable<UkomQuestion[]>
    questCheckedList: UkomQuestion[] = []
    submitLoadng$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    filterText: string = ''
    private searchSubject = new BehaviorSubject<string>('')

    listSavedQuestion: UkomQuestion[] = []

    payload = {
        id: '',
        exam_type_code: '',
        question_id_list: ['']
    }

    constructor(
        private apiService: ApiService,
        private activatedRoute: ActivatedRoute,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.activatedRoute.paramMap.pipe(first()).subscribe(params => {
            this.room_ukom_id = params.get('roomid');
        });

        this.activatedRoute.queryParams.pipe(first()).subscribe(params => {
            const type_ukom = params['type_ukom'];
            if (type_ukom) {
                this.type_ukom = type_ukom;
            }
        });

        this.getExamDetail()
        this.getListPertanyaan()
        this.getUkomTypeFromParams()
        this.getRoomUkomDetail()
    }

    back() {
        history.back()
    }

    getRoomUkomDetail() {
        this.apiService
            .getData(`/api/v1/room_ukom/${this.room_ukom_id}`)
            .subscribe({
                next: (res: any) => {
                    this.RoomUkomDetail = res

                    this.getListKompetensi()
                },
                error: (err: any) => {
                    this.handlerService.handleAlert('Error', 'Failed to get room detail')
                }
            })
    }

    getUkomTypeFromParams() {
        this.activatedRoute.queryParams.subscribe(params => {
            const type_ukom = params['type_ukom']

            if (type_ukom) {
                this.type_ukom = type_ukom
            }
        })
    }

    getExamDetail() {
        this.apiService
            .getData(`/api/v1/exam_schedule/room/${this.room_ukom_id}`)
            .subscribe({
                next: (res: any) => {
                    if (Array.isArray(res)) {
                        this.ExamDetail = res.find(
                            (exam: ExamDetail) => exam.examTypeCode === this.type_ukom
                        )
                        console.log('ExamDetail:', this.ExamDetail)
                    } else {
                        console.error('Unexpected response format: expected an array')
                        this.ExamDetail = null
                    }
                },
                error: (err: any) => {
                    console.error('Error fetching exam details:', err)
                    this.ExamDetail = null
                }
            })
    }

    getListKompetensi() {
        this.apiService
            .getData(
                `/api/v1/kompetensi/droplist?jabatan_code=${this.RoomUkomDetail.jabatanCode}&jenjang_code=${this.RoomUkomDetail.jenjangCode}`
            )
            .subscribe({
                next: (res: any) => {
                    this.UkomRoomKompetensi = res
                },
                error: (err: any) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Failed to get kompetensi list'
                    )
                }
            })
    }

    getDropDownQuestionList(kompetensi_id: string) {
        const module_id = 'CAT'
        const type = 'MULTI_CHOICE'

        this.listQuestion$ = this.apiService
            .getData(
                `/api/v1/question/droplist?association_id=${kompetensi_id}&module_id=${module_id}&type=${type}`
            )
            .pipe(
                map(response =>
                    response.map((question: UkomQuestion) => new UkomQuestion(question))
                )
            )

        this.filteredQuestions$ = this.searchSubject.pipe(
            debounceTime(300), // Delays input processing by 1 second
            distinctUntilChanged(), // Only emit if value changed
            switchMap(search =>
                this.listQuestion$.pipe(
                    map(questions =>
                        questions.filter(q =>
                            q.question.toLowerCase().includes(search.toLowerCase())
                        )
                    )
                )
            )
        )
    }

    onSearchChange(search: string) {
        this.searchSubject.next(search)
    }

    toggleModal(kompetensi_id?: string) {
        if (kompetensi_id) {
            this.openModal(kompetensi_id)
        } else {
            this.isModalOpen$.next(!this.isModalOpen$.value)
        }
    }

    onQuestionSelect(question: UkomQuestion) {
        if (question.checked) {
            if (!this.questCheckedList.some(q => q.id === question.id)) {
                this.questCheckedList.push(question)
                this.listQuestion$ = this.listQuestion$.pipe(
                    map(questions => {
                        return questions.map((q: UkomQuestion) => {
                            if (q.id === question.id) {
                                q.checked = true
                            }
                            return q
                        })
                    })
                )
            }
        } else {
            const index = this.questCheckedList.findIndex(q => q.id === question.id)
            if (index > -1) {
                this.questCheckedList.splice(index, 1)
                this.listQuestion$ = this.listQuestion$.pipe(
                    map(questions => {
                        return questions.map((q: UkomQuestion) => {
                            if (q.id === question.id) {
                                q.checked = false
                            }
                            return q
                        })
                    })
                )
            }
        }

        console.log('Updated questCheckedList:', this.questCheckedList)
    }

    updateCheckedState() {
        this.filteredQuestions$ = this.filteredQuestions$.pipe(
            map(questions => {
                return questions.map((question: UkomQuestion) => {
                    question.checked = this.questCheckedList.some(
                        q => q.id === question.id
                    )
                    return question
                })
            })
        )
    }

    getListPertanyaan() {
        const module_id = 'CAT'

        this.apiService
            .postData(
                `/api/v1/room_ukom/search/${module_id}/${this.room_ukom_id}?limit=1000`,
                {}
            )
            .subscribe({
                next: (res: any) => {
                    this.listSavedQuestion = res.data || []
                }
            })
    }

    openModal(kompetensi_id: string) {
        this.getDropDownQuestionList(kompetensi_id)
        this.updateCheckedState()
        this.isModalOpen$.next(true)
    }

    submit() {
        this.payload.id = this.room_ukom_id
        this.payload.exam_type_code = this.ExamDetail.examTypeCode
        this.payload.question_id_list = this.questCheckedList.map(q => q.id)

        this.confirmationService.open(false).subscribe({
            next: (res: any) => {
                if (!res.confirmed) return

                this.submitLoadng$.next(true)

                this.apiService
                    .postData('/api/v1/room_ukom/question', this.payload)
                    .subscribe({
                        next: (res: any) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan pertanyaan'
                            )
                            this.getListPertanyaan()
                            this.submitLoadng$.next(false)
                        },
                        error: (err: any) => {
                            console.error('Error:', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan pertanyaan'
                            )
                            this.submitLoadng$.next(false)
                        }
                    })
            },
            error: (err: any) => {
                console.error('Error:', err)
                this.handlerService.handleAlert('Error', 'Gagal menambahkan pertanyaan')
                this.submitLoadng$.next(false)
            }
        })
    }
}
