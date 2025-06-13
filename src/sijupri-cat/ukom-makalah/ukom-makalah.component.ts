import { HandlerService } from './../../modules/base/services/handler.service'
import { ConfirmationService } from './../../modules/base/services/confirmation.service'
import { ApiService } from './../../modules/base/services/api.service'
import { FIleHandler } from './../../modules/base/commons/file-handler/file-handler'
import {
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core'
import { FileHandlerComponent } from '../../modules/base/components/file-handler/file-handler.component'
import { FormBuilder, Validators } from '@angular/forms'
import { UkomQuestion } from '../../modules/ukom/models/ukom-question'
import {
    BehaviorSubject,
    concatMap,
    filter,
    finalize,
    switchMap,
    take,
    tap
} from 'rxjs'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
@Component({
    selector: 'app-ukom-makalah',
    standalone: true,
    imports: [FileHandlerComponent, CommonModule],
    templateUrl: './ukom-makalah.component.html',
    styleUrl: './ukom-makalah.component.scss'
})
export class UkomMakalahComponent {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent

    @Input() participant_id: string
    @Input() room_id: string
    @Output() afterSubmit = new EventEmitter<void>()

    question: UkomQuestion = new UkomQuestion()

    makalah_form = this.fb.group({
        file_answer_upload: ['', Validators.required]
    })

    inputs: FIleHandler = {
        files: {
            file_answer_upload: { label: 'File Makalah' }
        },
        allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
        listen: (key: string, base64Data: string) => {
            switch (key) {
                case 'file_answer_upload':
                    this.makalah_form.patchValue({
                        file_answer_upload: base64Data
                    })
                    break
            }
        }
    }

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )

    constructor (
        private fb: FormBuilder,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private router: Router
    ) {}

    ngOnChanges (changes: SimpleChanges): void {
        if ((changes['room_id'] || changes['participant_id']) && this.room_id) {
            this.getQuestion()
        }
    }

    clearFilesName () {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    getQuestion () {
        this.apiService
            .postData(
                `/api/v1/room_ukom/search/MAKALAH/${this.room_id}?limit=1000`,
                {}
            )
            .subscribe({
                next: (res: any) => {
                    if (res.data && res.data.length > 0) {
                        this.question = res.data[0]
                    }
                },
                error: err => {
                    console.error('Error fetching question:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil soal makalah'
                    )
                }
            })
    }

    onSubmit () {
        this.confirmationService
            .open(false)
            .pipe(
                take(1),
                filter(({ confirmed }) => confirmed),
                tap(() => this.isSubmitLoading$.next(true)),

                switchMap(() => {
                    const payload = {
                        participant_id: this.participant_id,
                        question_id: this.question.id,
                        file_answer_upload:
                            this.makalah_form.value.file_answer_upload
                    }
                    return this.apiService.postData(
                        '/api/v1/exam/answer',
                        payload
                    )
                }),

                concatMap(() => {
                    const finishPayload = {
                        examTypeCode: 'MAKALAH',
                        roomUkomId: this.room_id
                    }
                    return this.apiService.postData(
                        '/api/v1/exam/finish',
                        finishPayload
                    )
                }),

                finalize(() => this.isSubmitLoading$.next(false))
            )
            .subscribe({
                next: () => {
                    this.afterSubmit.emit()
                    this.handlerService.handleAlert(
                        'Success',
                        'Makalah berhasil disimpan'
                    )
                    this.makalah_form.reset()
                    this.clearFilesName()
                },
                error: error => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal menyimpan makalah'
                    )
                }
            })
    }
}
