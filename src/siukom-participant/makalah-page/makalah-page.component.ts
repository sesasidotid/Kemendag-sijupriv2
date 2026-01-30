// import { Component } from '@angular/core'
// import { RoomUkom } from '../../modules/ukom/models/room-ukom.model'
// import { ApiService } from '../../modules/base/services/api.service'
// import { Router } from '@angular/router'
// import { HandlerService } from '../../modules/base/services/handler.service'
// import { LoginContext } from '../../modules/base/commons/login-context'
// import { tap } from 'rxjs'
// import { UkomMakalahComponent } from '@/siukom-participant/makalah-page/ukom-makalah/ukom-makalah.component'
// import { CommonModule } from '@angular/common'
//
// @Component({
//     selector: 'app-makalah-page',
//     standalone: true,
//     imports: [UkomMakalahComponent, CommonModule],
//     templateUrl: './makalah-page.component.html',
//     styleUrl: './makalah-page.component.scss',
// })
// export class MakalahPageComponent {
//     participant_id: string = ''
//     roomUkom: RoomUkom = new RoomUkom()
//
//     constructor(
//         private apiService: ApiService,
//         private router: Router,
//         private handlerService: HandlerService,
//     ) {}
//
//     ngOnInit() {
//         this.getRoomUkom()
//     }
//
//     backToDashboard() {
//         this.router.navigate(['/'])
//     }
//
//     getRoomUkom(): void {
//         const userId = LoginContext.getUserId().replace('PU-', '')
//
//         this.apiService
//             .getData(`/api/v1/participant_ukom/nip/${userId}`)
//             .pipe(
//                 tap((response: any) => {
//                     this.roomUkom = new RoomUkom(response.roomUkomDto)
//                     this.participant_id = response.id
//                 }),
//             )
//             .subscribe({
//                 next: () => {},
//                 error: (err) => {
//                     console.error('Error fetching RoomUkom or scores:', err)
//                     this.handlerService.handleAlert(
//                         'Error',
//                         'Gagal mengambil data.',
//                     )
//                 },
//             })
//     }
// }
import { Component, computed, effect, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { LoginContext } from '@/modules/base/commons/login-context'
import { ActivatedRoute, Router } from '@angular/router'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { ParticpantStudyCaseExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { FormsModule } from '@angular/forms'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-makalah-page',
    standalone: true,
    imports: [
        CommonModule,
        EmptyStateComponent,
        FileHandlerComponent,
        FormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './makalah-page.component.html',
    styleUrl: './makalah-page.component.scss',
})
export class MakalahPageComponent {
    userId: string

    questionLoading = signal(false)
    participantLoading = signal(false)
    pageLoading = computed(() => {
        return this.questionLoading() || this.participantLoading()
    })

    answerFile = signal('')
    submitLoading = signal(false)

    examId = signal('')
    participant = signal<Participant>(null)
    question = signal<ExamQuestion>(null)
    router = inject(Router)
    route = inject(ActivatedRoute)
    participantService = inject(UkomParticipantService)
    examService = inject(ExamService)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)

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

    // Error states
    criticalError = signal<boolean>(false)
    errorMessage = signal<string>('')

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
                this.question()
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
        this.participantLoading.set(true)
        this.participantService
            .getParticipantUkom(this.userId)
            .pipe(
                finalize(() => {
                    this.participantLoading.set(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.participant.set(res)
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
                    const selectedQuestion = res.data.find(
                        (q) => q.id === 'base_makalah_question',
                    )

                    this.question.set(selectedQuestion)
                    if (!silent) {
                        this.questionLoading.set(false)
                    }
                },
                error: (err) => {
                    console.error('Error fetching question:', err)
                    if (!silent) {
                        this.criticalError.set(true)
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

    backToDashboard() {
        this.router.navigate(['/'])
    }

    hasExistingAnswer(): boolean {
        return !!this.question()?.answerDto?.answerUploadUrl
    }

    submitAnswer() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.submitLoading.set(true)

                const payload = new ParticpantStudyCaseExamAnswer({
                    participantId: this.participant().id,
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
        const selectedQuestion = this.question()

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
