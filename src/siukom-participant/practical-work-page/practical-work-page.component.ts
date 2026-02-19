import {
    Component,
    computed,
    effect,
    inject,
    OnInit,
    signal,
} from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { VideoPreviewComponent } from '@/modules/base/components/video-preview/video-preview.component'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ActivatedRoute, Router } from '@angular/router'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { LoginContext } from '@/modules/base/commons/login-context'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { ParticipantExamLayoutComponent } from '@/siukom-participant/_shared/components/participant-exam-layout/participant-exam-layout.component'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { ParticipantPracticalExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'

@Component({
    selector: 'app-practical-work-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        InvalidOnTouchDirective,
        LoadingButtonComponent,
        VideoPreviewComponent,
        EmptyStateComponent,
        ParticipantExamLayoutComponent,
        FileHandlerComponent,
    ],
    templateUrl: './practical-work-page.component.html',
    styleUrl: './practical-work-page.component.scss',
})
export class PracticalWorkPageComponent implements OnInit {
    examId = signal('')
    submittingVideo = signal(false)
    submittingDocument = signal(false)
    videoForm!: FormGroup
    formValidationService = inject(FormValidationService)
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    router = inject(Router)
    route = inject(ActivatedRoute)
    fb = inject(FormBuilder)
    examService = inject(ExamService)
    questionLoading = signal(false)
    question = signal<ExamQuestion>(null)
    criticalError = signal<boolean>(false)
    errorMessage = signal<string>('')

    hasExistingVideoLink = computed(() => {
        if (!this.question()) return false
        return !!this.question()?.answerDto?.answerText
    })

    hasExistingDocument = computed(() => {
        if (!this.question()) return false
        return !!this.question()?.answerDto?.answerUploadUrl
    })
    mapQuestionText = computed(() => {
        const q = this.question()
        if (!q || !q.question) return ''
        if (q.question === 'Silahkan masukkan link drive anda') {
            return 'Silahkan masukkan link video persiapan anda'
        }
        return q.question
    })
    answerFile = signal('')
    inputs = signal<FIleHandler>({
        files: {
            answerFile: { label: 'Dokumen Hasil Kerja', required: false },
        },
        allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
        listen: (key: string, base64Data: string) => {
            this.answerFile.set(base64Data)
        },
    })
    readonly userId: string
    protected readonly ExamTypeCategory = ExamTypeCategory

    constructor() {
        const raw = LoginContext.getUserId()
        if (!raw) {
            this.criticalError.set(true)
            this.errorMessage.set(
                'UserId tidak ditemukan. Silakan login ulang.',
            )
        }

        this.userId = raw.replace(/^PU-/, '')

        effect(
            () => {
                const examId = this.examId()
                if (!examId) return

                this.getQuestion()
            },
            { allowSignalWrites: true },
        )

        effect(
            () => {
                const question = this.question()
                if (question?.answerDto?.answerText) {
                    this.videoForm
                        .get('videoLink')
                        ?.setValue(question.answerDto.answerText)
                }

                this.initFileHandlerInputs(question)
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            this.examId.set(params.get('examScheduleId'))
        })
        this.initForm()
    }

    reloadPage() {
        window.location.reload()
    }

    getQuestion(silent: boolean = false) {
        if (!silent) {
            this.questionLoading.set(true)
        }
        this.examService
            .getExamQuestionByScheduleId(this.examId(), {
                limit: '1000',
                page: '1',
            })
            .pipe(
                finalize(() => {
                    if (!silent) {
                        this.questionLoading.set(false)
                    }
                }),
            )
            .subscribe({
                next: (res) => {
                    const question = res.data.find(
                        (q) => q.id === 'base_praktik_question',
                    )
                    if (!question) {
                        this.criticalError.set(true)
                        this.errorMessage.set(
                            'Soal praktik tidak ditemukan untuk jadwal ujian ini. Silahkan hubungi panitia ujian',
                        )
                        return
                    }
                    this.question.set(question)
                },
                error: (err) => {
                    console.error('Error fetching question:', err)
                    this.criticalError.set(true)
                    this.errorMessage.set(
                        'Gagal memuat soal praktik. Silakan reload halaman atau hubungi panitia ujian jika masalah berlanjut.',
                    )
                },
            })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.videoForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    initForm() {
        this.videoForm = this.fb.group({
            videoLink: [
                '',
                [Validators.required, Validators.pattern(/https?:\/\/.+/)],
            ],
        })
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    submitVideoLink() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submittingVideo.set(true)

                const payload = new ParticipantPracticalExamAnswer({
                    participantId: this.userId,
                    questionId: this.question().id,
                    answerText: this.videoForm.get('videoLink')?.value,
                })

                this.examService
                    .saveExamAnswerForParticipantByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(
                        finalize(() => {
                            this.submittingVideo.set(false)
                        }),
                    )
                    .subscribe({
                        next: (res) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Link video berhasil disimpan',
                            )
                            // Refetch question to update preview with new answer
                            this.getQuestion()
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan link video. Silakan coba lagi.',
                            )
                        },
                    })
            },
        })
    }

    submitDocument() {
        if (!this.answerFile()) {
            this.handlerService.handleAlert(
                'Error',
                'Pilih file dokumen terlebih dahulu.',
            )
            return
        }

        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submittingDocument.set(true)
                const payload = new ParticipantPracticalExamAnswer({
                    participantId: this.userId,
                    questionId: this.question().id,
                    fileAnswerUpload: this.answerFile(),
                })

                this.examService
                    .saveExamAnswerForParticipantByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(
                        finalize(() => {
                            this.submittingDocument.set(false)
                        }),
                    )
                    .subscribe({
                        next: (res) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Dokumen pendukung berhasil diunggah',
                            )
                            // Refetch question to update preview with new answer
                            this.getQuestion()
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengunggah dokumen. Silakan coba lagi.',
                            )
                        },
                    })
            },
        })
    }

    private initFileHandlerInputs(question: ExamQuestion | null) {
        if (!question) return

        const hasAnswer =
            question.answerDto?.answerUpload &&
            question.answerDto?.answerUploadUrl

        this.inputs.set({
            files: {
                answerFile: {
                    label: 'Dokumen Hasil Kerja',
                    required: false,
                    ...(hasAnswer && {
                        fileName: question.answerDto.answerUpload,
                        source: question.answerDto.answerUploadUrl,
                    }),
                },
            },
            allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
            maxSize: 2 * 1024 * 1024,
            listen: (key: string, base64Data: string) => {
                this.answerFile.set(base64Data)
            },
        })
    }
}
