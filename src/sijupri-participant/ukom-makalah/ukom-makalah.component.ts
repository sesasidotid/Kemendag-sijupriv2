import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ApiService } from '@/modules/base/services/api.service'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import {
    Component,
    EventEmitter,
    Input,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FormBuilder, Validators } from '@angular/forms'
import { UkomQuestion } from '@/modules/ukom/models/ukom-question'
import {
    BehaviorSubject,
    combineLatest,
    filter,
    finalize,
    map,
    Observable,
    switchMap,
    take,
    tap,
} from 'rxjs'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { MakalahAnswer } from '@/modules/ukom/models/cat/makalah-answer'
@Component({
    selector: 'app-ukom-makalah',
    standalone: true,
    imports: [FileHandlerComponent, CommonModule],
    templateUrl: './ukom-makalah.component.html',
    styleUrl: './ukom-makalah.component.scss',
})
export class UkomMakalahComponent {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent

    @Input() participant_id: string
    @Input() room_id: string
    @Output() afterSubmit = new EventEmitter<void>()

    question: UkomQuestion = new UkomQuestion()
    answer: MakalahAnswer = new MakalahAnswer()

    makalah_form = this.fb.group({
        file_answer_upload: ['', Validators.required],
    })

    inputs: FIleHandler = {
        files: {
            file_answer_upload: { label: 'File Makalah' },
        },
        allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
        listen: (key: string, base64Data: string) => {
            switch (key) {
                case 'file_answer_upload':
                    this.makalah_form.patchValue({
                        file_answer_upload: base64Data,
                    })
                    break
            }
        },
    }

    isSubmitLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )
    isLoadingAnswerFile$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(true)
    isQuestionLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        true,
    )
    isFinished: boolean = false
    isLoading$: Observable<boolean>

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private router: Router,
    ) {
        this.isLoading$ = combineLatest([
            this.isLoadingAnswerFile$,
            this.isQuestionLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['room_id'] || changes['participant_id']) && this.room_id) {
            this.getQuestion()
            this.getAnswerFile()
        }
    }

    clearFilesName() {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    getAnswerFile() {
        this.isLoadingAnswerFile$.next(true)
        this.apiService
            .getData(
                `/api/v1/exam/page/MAKALAH/${this.room_id}?page=1&limit=10`,
            )
            .pipe(
                finalize(() => {
                    this.isLoadingAnswerFile$.next(false)
                }),
            )
            .subscribe({
                next: (res: any) => {
                    if (
                        res.data &&
                        res.data.length > 0 &&
                        res.data[0].answerDto
                    ) {
                        this.answer = new MakalahAnswer(res)
                        const answerDto = this.answer.data[0].answerDto

                        if (
                            answerDto.answerUpload &&
                            answerDto.answerUploadUrl
                        ) {
                            this.inputs.files['file_answer_upload'].fileName =
                                answerDto.answerUpload
                            this.inputs.files['file_answer_upload'].source =
                                answerDto.answerUploadUrl

                            if (this.fileHandler) {
                                this.fileHandler.fileNames[
                                    'file_answer_upload'
                                ] = answerDto.answerUpload
                            }
                        }
                    }
                },
                error: (err) => {
                    if (err.error.message === `Exam's already ended`) {
                        this.isFinished = true
                    } else {
                        console.error('Error fetching answer file:', err)
                        this.handlerService.handleAlert(
                            'Error',
                            'Gagal mengambil file jawaban makalah',
                        )
                    }
                },
            })
    }

    backToHome() {
        this.router.navigate(['/'])
    }

    getQuestion() {
        this.isQuestionLoading$.next(true)
        this.apiService
            .postData(
                `/api/v1/room_ukom/search/MAKALAH/${this.room_id}?limit=1000`,
                {},
            )
            .pipe(
                finalize(() => {
                    this.isQuestionLoading$.next(false)
                }),
            )
            .subscribe({
                next: (res: any) => {
                    if (res.data && res.data.length > 0) {
                        this.question = res.data[0]
                    }
                },
                error: (err) => {
                    console.error('Error fetching question:', err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil soal makalah',
                    )
                },
            })
    }

    onSubmit() {
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
                            this.makalah_form.value.file_answer_upload,
                    }
                    return this.apiService.postData(
                        '/api/v1/exam/answer',
                        payload,
                    )
                }),
                finalize(() => this.isSubmitLoading$.next(false)),
            )
            .subscribe({
                next: () => {
                    this.afterSubmit.emit()
                    this.handlerService.handleAlert(
                        'Success',
                        'Makalah berhasil disimpan',
                    )
                    this.makalah_form.reset()
                    this.clearFilesName()
                },
                error: () => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal menyimpan makalah',
                    )
                },
            })
    }
}
