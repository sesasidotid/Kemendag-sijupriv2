import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ApiService } from '@/modules/base/services/api.service'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import {
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    signal,
    ViewChild,
} from '@angular/core'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FormBuilder, Validators } from '@angular/forms'
import {
    BehaviorSubject,
    filter,
    finalize,
    Observable,
    switchMap,
    take,
    tap,
} from 'rxjs'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'

@Component({
    selector: 'app-ukom-makalah',
    standalone: true,
    imports: [FileHandlerComponent, CommonModule],
    templateUrl: './ukom-makalah.component.html',
    styleUrl: './ukom-makalah.component.scss',
})
export class UkomMakalahComponent implements OnInit {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent

    @Input() participant_id: string
    @Input() room_id: string
    @Output() afterSubmit = new EventEmitter<void>()

    question: ExamQuestion
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
    questionLoading = signal(false)
    isLoading$: Observable<boolean>
    examScheduleId: string
    examService = inject(ExamService)
    private route = inject(ActivatedRoute)

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.examScheduleId = params.get('examScheduleId')
            this.getQuestion()
        })
    }

    clearFilesName() {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    getQuestion() {
        this.questionLoading.set(true)
        this.examService
            .getExamQuestionByScheduleId(this.examScheduleId, {
                limit: '1000',
                page: '1',
            })
            .pipe(
                finalize(() => {
                    this.questionLoading.set(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    if (res.data && res.data.length > 0) {
                        this.question = res.data[0]
                        this.getAnswerFile(this.question)
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

    getAnswerFile(question: ExamQuestion) {
        const answerDto = question.answerDto
        if (answerDto.answerUpload && answerDto.answerUploadUrl) {
            this.inputs.files['file_answer_upload'].fileName =
                answerDto.answerUpload
            this.inputs.files['file_answer_upload'].source =
                answerDto.answerUploadUrl

            if (this.fileHandler) {
                this.fileHandler.fileNames['file_answer_upload'] =
                    answerDto.answerUpload
            }
        }
    }

    backToDashboard() {
        this.router.navigate(['/'])
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
                        `/api/v1/exam/answer/${this.examScheduleId}`,
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
