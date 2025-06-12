import { Component, Input, SimpleChanges } from '@angular/core'
import { RoomUkomDetail } from '../../../../modules/ukom/models/room-ukom-detail'
import { ExamDetail } from '../../../../modules/ukom/models/exam_detail'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject, forkJoin } from 'rxjs'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { UkomQuestion } from '../../../../modules/ukom/models/ukom-question'
@Component({
    selector: 'app-ukom-exam-makalah',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ukom-exam-makalah.component.html',
    styleUrl: './ukom-exam-makalah.component.scss'
})
export class UkomExamMakalahComponent {
    @Input() room_ukom_detail: RoomUkomDetail
    @Input() exam_detail: ExamDetail

    question_text: string = ''

    payload = {
        id: '',
        exam_type_code: '',
        question: ''
    }

    submitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )

    listSavedQuestion: UkomQuestion[] = []

    constructor (
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnChanges (changes: SimpleChanges): void {
        if (
            (changes['exam_detail'] || changes['room_ukom_detail']) &&
            this.exam_detail?.examTypeCode &&
            this.room_ukom_detail?.id
        ) {
            this.getListPertanyaan()
        }
    }

    getListPertanyaan () {
        const module_id = this.exam_detail.examTypeCode

        this.apiService
            .postData(
                `/api/v1/room_ukom/search/${module_id}/${this.room_ukom_detail.id}?limit=1000`,
                {}
            )
            .subscribe({
                next: (res: any) => {
                    this.listSavedQuestion = res.data || []
                }
            })
    }

    onSubmit () {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitLoading$.next(true)
                this.payload = {
                    id: this.room_ukom_detail.id,
                    exam_type_code: this.exam_detail.examTypeCode,
                    question: this.question_text
                }
                this.apiService
                    .postData('/api/v1/room_ukom/question', this.payload)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Petunjuk/Pertanyaan  makalah berhasil ditambahkan'
                            )

                            this.submitLoading$.next(false)
                            this.payload = {
                                id: '',
                                exam_type_code: '',
                                question: ''
                            }
                            this.question_text = ''
                            this.getListPertanyaan()
                        },
                        error: (err: any) => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan petunjuk/pertanyaan makalah'
                            )
                            this.submitLoading$.next(false)
                        }
                    })
            }
        })
    }
}
