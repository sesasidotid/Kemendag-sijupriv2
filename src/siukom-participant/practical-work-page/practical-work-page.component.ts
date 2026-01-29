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
    ],
    templateUrl: './practical-work-page.component.html',
    styleUrl: './practical-work-page.component.scss',
})
export class PracticalWorkPageComponent implements OnInit {
    examId = signal('')
    submitting = signal(false)

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
    hasExistingAnswer = computed(() => {
        if (!this.question()) return false
        return !!this.question()?.answerDto?.answerText
    })

    mapQuestionText = computed(() => {
        const q = this.question()
        if (!q || !q.question) return ''
        if (q.question === 'Silahkan masukkan link drive anda') {
            return 'Silahkan masukkan link video persiapan anda'
        }
        return q.question
    })

    readonly userId: string
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

        effect(() => {
            this.question()
            this.getUploadedVideoLink()
        })
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

    getQuestion() {
        this.questionLoading.set(true)
        this.examService
            .getExamQuestionByScheduleId(this.examId(), {
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

    getUploadedVideoLink() {
        if (this.question()?.answerDto?.answerText) {
            this.videoForm
                .get('videoLink')
                ?.setValue(this.question()?.answerDto?.answerText)
        }
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    submitVideoLink() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitting.set(true)
                const payload = {
                    participantId: this.userId,
                    questionId: this.question().id,
                    answerText: this.videoForm.get('videoLink')?.value,
                }
                this.examService
                    .saveExamAnswerForParticipantByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(
                        finalize(() => {
                            this.submitting.set(false)
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
}
