import { Component, effect, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MultiFileHandlerComponent } from '@/modules/base/components/multi-file-handler/multi-file-handler.component'
import {
    MultiFileHandler,
    UploadedFile,
} from '@/modules/base/commons/file-handler/multi-file-handler'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { ExamService } from '@/modules/ukom/services/exam.service'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { PdfMergeService } from '@/modules/base/services/pdf-merge.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { LoginContext } from '@/modules/base/commons/login-context'
import { Participant } from '@/modules/ukom/models/cat/participant.model'
import { ParticipantPortfolioExamAnswer } from '@/modules/ukom/models/exam/exam-answer.model'

@Component({
    selector: 'app-portfolio-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MultiFileHandlerComponent,
        LoadingButtonComponent,
    ],
    templateUrl: './portfolio-page.component.html',
    styleUrl: './portfolio-page.component.scss',
})
export class PortfolioPageComponent implements OnInit {
    resetKey = signal<string | null>(null)

    examId = signal('')
    questionLoading = signal(false)
    submitLoading = signal(false)
    questions = signal<ExamQuestion[]>([])

    // Error states
    criticalError = signal<boolean>(false)
    errorMessage = signal<string>('')

    // Track which questions are currently being saved
    savingQuestions = new Map<string, boolean>()

    answerMap = new Map<string, UploadedFile[]>()

    // Track which questions have been touched by the user (for validation)
    touchedQuestions = new Set<string>()

    // Pre-computed MultiFileHandler inputs for each question to maintain stable references
    multiFileHandlerInputsMap = new Map<string, MultiFileHandler>()

    router = inject(Router)
    route = inject(ActivatedRoute)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)

    examService = inject(ExamService)
    pdfMergeService = inject(PdfMergeService)

    participantService = inject(UkomParticipantService)
    participant: Participant
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
            const questions = this.questions()
            if (!questions.length) return

            this.initMultiFileHandlerInputs()
        })
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
                    console.log('Fetched question:', res)
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
                        if (err.error?.cause === 'attendance not found') {
                            this.errorMessage.set(
                                'Anda belum memulai jadwal ujian ini. Silahkan mulai ujian di dashboard anda.',
                            )
                        } else {
                            this.errorMessage.set(
                                'Gagal memuat soal ujian. Silakan reload halaman atau hubungi panitia ujian jika masalah berlanjut.',
                            )
                        }
                        this.questionLoading.set(false)
                    }
                },
            })
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    reloadPage() {
        window.location.reload()
    }

    getMultiFileHandlerInputs(q: ExamQuestion): MultiFileHandler {
        return this.multiFileHandlerInputsMap.get(q.id)!
    }

    trackByQuestionId(index: number, q: ExamQuestion): string {
        return q.id
    }

    onFilesUpdated(questionId: string, files: UploadedFile[]) {
        // Mark this question as touched
        this.touchedQuestions.add(questionId)

        if (files.length > 0) {
            this.answerMap.set(questionId, files)
        } else {
            this.answerMap.delete(questionId)
        }
    }

    getTotalFilesCount(): number {
        let total = 0
        this.answerMap.forEach((files) => {
            total += files.length
        })
        return total
    }

    checkAllQuestionsAnswered(): boolean {
        return this.questions().every((q) => {
            const hasSavedAnswer = q.answerDto?.answerUpload

            if (!hasSavedAnswer) {
                return false // No saved answer at all
            }

            // Check if user has touched this question
            const hasBeenTouched = this.touchedQuestions.has(q.id)

            if (!hasBeenTouched) {
                // User never touched this question, saved answer is still valid
                return true
            }

            // User has touched this question, check current files
            const currentFiles = this.answerMap.get(q.id)

            // If user touched but removed all files, invalid
            if (!currentFiles || currentFiles.length === 0) {
                return false
            }

            // If there are files, check if the saved file is still there
            const savedFileStillExists = currentFiles.some((f) =>
                f.id.startsWith('saved_'),
            )

            return savedFileStillExists
        })
    }

    isQuestionSaving(questionId: string): boolean {
        return this.savingQuestions.get(questionId) || false
    }

    canSaveQuestion(questionId: string): boolean {
        const files = this.answerMap.get(questionId)
        if (!files || files.length === 0 || this.isQuestionSaving(questionId)) {
            return false
        }

        // Check if there are any new files (not saved files)
        const hasNewFiles = files.some((f) => !f.id.startsWith('saved_'))
        return hasNewFiles
    }

    async saveQuestion(question: ExamQuestion) {
        const files = this.answerMap.get(question.id)
        if (!files || files.length === 0) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file untuk disimpan',
            )
            return
        }

        // Check if there are new files to save
        const newFiles = files.filter((f) => !f.id.startsWith('saved_'))
        if (newFiles.length === 0) {
            this.handlerService.handleAlert(
                'Error',
                'Tidak ada file baru untuk disimpan',
            )
            return
        }

        this.savingQuestions.set(question.id, true)

        try {
            // Process all files and convert to base64
            const base64Pdfs: string[] = []

            for (const file of files) {
                if (file.id.startsWith('saved_')) {
                    // This is a saved file with URL - fetch and convert to base64
                    try {
                        const response = await fetch(file.base64)
                        const blob = await response.blob()
                        const base64 = await this.blobToBase64(blob)
                        // Remove data URI prefix if present
                        const cleanBase64 = base64.replace(
                            /^data:application\/pdf;base64,/,
                            '',
                        )
                        base64Pdfs.push(cleanBase64)
                    } catch (error) {
                        console.error('Error fetching saved file:', error)
                        throw new Error('Gagal mengambil file tersimpan')
                    }
                } else {
                    // This is a new uploaded file with base64
                    const cleanBase64 = file.base64.replace(
                        /^data:application\/pdf;base64,/,
                        '',
                    )
                    base64Pdfs.push(cleanBase64)
                }
            }

            // Merge all PDFs (existing saved + new uploads)
            const mergedPdfBase64 =
                await this.pdfMergeService.mergePdfs(base64Pdfs)

            // Prepare payload
            const payload = new ParticipantPortfolioExamAnswer({
                participantId: this.participant.id,
                questionId: question.id,
                fileAnswerUpload:
                    this.pdfMergeService.getDataUri(mergedPdfBase64),
            })

            // Save to API
            this.examService
                .saveExamAnswerForParticipantByExamScheduleId(
                    this.examId(),
                    payload,
                )
                .pipe(
                    finalize(() => {
                        this.savingQuestions.set(question.id, false)
                    }),
                )
                .subscribe({
                    next: () => {
                        this.handlerService.handleAlert(
                            'Success',
                            'Jawaban berhasil disimpan',
                        )
                        // Clear the uploaded files for this question
                        this.answerMap.delete(question.id)
                        // Reset touched state since we saved successfully
                        this.touchedQuestions.delete(question.id)
                        // Silently refetch questions to get updated answers
                        // The effect will automatically reinitialize file handlers with new data
                        this.getQuestion(true)
                    },
                    error: (err) => {
                        console.error('Error saving answer:', err)
                        this.handlerService.handleAlert(
                            'Error',
                            'Gagal menyimpan jawaban',
                        )
                    },
                })
        } catch (error) {
            console.error('Error processing PDFs:', error)
            this.handlerService.handleAlert('Error', 'Gagal memproses file PDF')
            this.savingQuestions.set(question.id, false)
        }
    }

    submitPortfolio() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
            },
        })
    }

    private blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    }

    private initMultiFileHandlerInputs() {
        // Clear existing map to ensure fresh initialization
        this.multiFileHandlerInputsMap.clear()

        for (const q of this.questions()) {
            // Check if question already has a saved answer
            const initialFiles: UploadedFile[] = []
            if (q.answerDto?.answerUploadUrl) {
                initialFiles.push({
                    id: `saved_${q.id}`,
                    fileName: q.answerDto.answerUpload || `jawaban_${q.id}.pdf`,
                    base64: q.answerDto.answerUploadUrl,
                })
            }

            this.multiFileHandlerInputsMap.set(q.id, {
                files: {
                    [q.id]: {
                        label: 'Unggah Jawaban',
                        initialFiles: initialFiles,
                    },
                },
                allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
                maxSize: 2 * 1024 * 1024,
                maxFiles: 10,
                listen: (key: string, files: UploadedFile[]) => {
                    this.onFilesUpdated(q.id, files)
                },
            })
        }
    }
}
