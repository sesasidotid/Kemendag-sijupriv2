import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { FormsModule } from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoginContext } from '@/modules/base/commons/login-context'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { ParticpantStudyCaseExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { Participant } from '@/modules/ukom/models/cat/participant.model'

@Component({
    selector: 'app-studi-kasus-page',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        FormsModule,
    ],
    templateUrl: './studi-kasus-page.component.html',
    styleUrl: './studi-kasus-page.component.scss',
})
export class StudiKasusPageComponent implements OnInit {
    questionLoading = signal(false)
    questionFileUrl: string =
        'https://morth.nic.in/sites/default/files/dd12-13_0.pdf'

    filePreviewService = inject(FilePreviewService)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)
    router = inject(Router)
    answerFile = signal('')
    inputs = signal<FIleHandler>({
        files: {
            answerFile: { label: 'Jawaban Anda' },
        },
        allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
        maxSize: 2 * 1024 * 1024,
        listen: (key: string, base64Data: string) => {
            this.answerFile.set(base64Data)
        },
    })
    submitLoading = signal(false)
    readonly userId: string

    // Error states
    criticalError = signal<boolean>(false)
    errorMessage = signal<string>('')
    route = inject(ActivatedRoute)
    examId = signal('')
    examService = inject(ExamService)
    questions = signal<ExamQuestion[]>([])
    participant: Participant
    participantService = inject(UkomParticipantService)

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
                const questions = this.questions()
                if (!questions.length) return

                this.initFileHandlerInputs()
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            this.examId.set(paramMap.get('examScheduleId'))
        })
        this.getParticipantDetail()
    }

    getParticipantDetail() {
        this.participantService.getParticipantUkom(this.userId).subscribe({
            next: (res) => {
                this.participant = new Participant(res)
            },
            error: (err) => {
                console.error('Error fetching participant details:', err)
                this.criticalError.set(true)
                this.errorMessage.set(
                    'Gagal memuat data peserta. Silakan reload halaman atau hubungi panitia ujian jika masalah berlanjut.',
                )
            },
        })
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
                    const sortedQuestions = res.data.sort((a, b) =>
                        a.id.localeCompare(b.id),
                    )
                    this.questions.set(sortedQuestions)
                    if (!silent) {
                        this.questionLoading.set(false)
                    }
                },
                error: (err) => {
                    console.error('Error fetching question:', err)
                    if (!silent) {
                        this.criticalError.set(true)
                        // if (err.error?.cause === 'attendance not found') {
                        //     this.errorMessage.set(
                        //         'Anda belum memulai jadwal ujian ini. Silahkan mulai ujian di dashboard anda.',
                        //     )
                        // } else {
                        //     this.errorMessage.set(
                        //         'Gagal memuat soal ujian. Silakan reload halaman atau hubungi panitia ujian jika masalah berlanjut.',
                        //     )
                        // }
                        this.errorMessage.set(
                            'Gagal memuat soal ujian. Silakan reload halaman atau hubungi panitia ujian jika masalah berlanjut.',
                        )
                        this.questionLoading.set(false)
                    }
                },
            })
    }

    reloadPage() {
        window.location.reload()
    }

    previewQuestionFile() {
        const selectedQuestion = this.questions().find(
            (q) => q.id === 'base_studi_kasus_question',
        )
        console.log('selectedQuestion', selectedQuestion)
        if (!selectedQuestion) {
            this.handlerService.handleAlert(
                'Error',
                'Soal studi kasus tidak ditemukan.',
            )
            return
        }
        this.filePreviewService.open(
            selectedQuestion.attachment,
            selectedQuestion.attachmentUrl,
        )
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    hasExistingAnswer(): boolean {
        const selectedQuestion = this.questions().find(
            (q) => q.id === 'base_studi_kasus_question',
        )
        return !!selectedQuestion?.answerDto?.answerUpload
    }

    submitAnswer() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.submitLoading.set(true)

                const payload = new ParticpantStudyCaseExamAnswer({
                    participantId: this.participant.id,
                    questionId: 'base_studi_kasus_question',
                    fileAnswerUpload: this.answerFile(),
                })

                this.examService
                    .saveExamAnswerForParticipantByExamScheduleId(
                        this.examId(),
                        payload,
                    )
                    .pipe(
                        finalize(() => {
                            this.submitLoading.set(false)
                        }),
                    )
                    .subscribe({
                        next: (res) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Jawaban studi kasus berhasil diunggah.',
                            )
                            // Silently refetch to get updated answer
                            this.getQuestion(true)
                        },
                        error: (err) => {
                            console.error('Error submitting answer:', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengunggah jawaban studi kasus. Silakan coba lagi atau hubungi panitia ujian jika masalah berlanjut.',
                            )
                        },
                    })
            },
        })
    }

    private initFileHandlerInputs() {
        const selectedQuestion = this.questions().find(
            (q) => q.id === 'base_studi_kasus_question',
        )

        if (!selectedQuestion) return

        // Check if question already has a saved answer
        const hasAnswer =
            selectedQuestion.answerDto?.answerUpload &&
            selectedQuestion.answerDto?.answerUploadUrl

        this.inputs.set({
            files: {
                answerFile: {
                    label: 'Jawaban Anda',
                    ...(hasAnswer && {
                        fileName: selectedQuestion.answerDto.answerUpload,
                        source: selectedQuestion.answerDto.answerUploadUrl,
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
