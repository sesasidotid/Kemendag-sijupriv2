import { Component, inject, OnInit, signal } from '@angular/core'
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

interface PortfolioQuestion {
    id: string
    question: string
    type: 'UPLOADS'
    moduleId: string
    parentQuestionId: string
}

const DUMMY_PORTFOLIO_QUESTIONS: PortfolioQuestion[] = [
    {
        id: 'q1',
        question: 'Jelaskan pengalaman Anda sebagai Negosiator Perdagangan',
        type: 'UPLOADS',
        moduleId: 'PRACTICAL_WORK',
        parentQuestionId: 'base_makalah_question',
    },
    {
        id: 'q2',
        question: 'Lampirkan laporan kegiatan perdagangan terakhir',
        type: 'UPLOADS',
        moduleId: 'PRACTICAL_WORK',
        parentQuestionId: 'base_makalah_question',
    },
]

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
    questions = signal(DUMMY_PORTFOLIO_QUESTIONS)

    answerMap = new Map<string, UploadedFile[]>()

    // Pre-computed MultiFileHandler inputs for each question to maintain stable references
    multiFileHandlerInputsMap = new Map<string, MultiFileHandler>()

    router = inject(Router)
    route = inject(ActivatedRoute)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)
    ngOnInit() {
        this.route.paramMap.subscribe((paramMap) => {
            this.examId.set(paramMap.get('examScheduleId'))
            this.initMultiFileHandlerInputs()
        })
    }

    backToDashboard() {
        this.router.navigate(['/'])
    }

    getMultiFileHandlerInputs(q: PortfolioQuestion): MultiFileHandler {
        return this.multiFileHandlerInputsMap.get(q.id)!
    }

    trackByQuestionId(index: number, q: PortfolioQuestion): string {
        return q.id
    }

    onFilesUpdated(questionId: string, files: UploadedFile[]) {
        if (files.length > 0) {
            this.answerMap.set(questionId, files)
        } else {
            this.answerMap.delete(questionId)
        }
    }

    getUploadedFilesCount(questionId: string): number {
        return this.answerMap.get(questionId)?.length || 0
    }

    getTotalFilesCount(): number {
        let total = 0
        this.answerMap.forEach((files) => {
            total += files.length
        })
        return total
    }

    checkAllQuestionsAnswered(): boolean {
        return this.questions().every(
            (q) =>
                this.answerMap.has(q.id) &&
                this.answerMap.get(q.id)!.length > 0,
        )
    }

    submitPortfolio() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitLoading.set(true)
                // Convert Map to a more API-friendly format
                const payload = this.questions().map((q) => ({
                    questionId: q.id,
                    files:
                        this.answerMap.get(q.id)?.map((f) => ({
                            fileName: f.fileName,
                            base64: f.base64,
                        })) || [],
                }))

                console.log('FINAL ANSWER MAP:', payload)
                console.log('Total files uploaded:', this.getTotalFilesCount())

                setTimeout(() => {
                    this.submitLoading.set(false)
                    this.resetInputs()
                }, 2000)
                // TODO: send to API
            },
        })
    }

    resetInputs() {
        this.answerMap.clear()
        this.resetKey.set(Date.now().toString())
    }

    private initMultiFileHandlerInputs() {
        for (const q of this.questions()) {
            this.multiFileHandlerInputsMap.set(q.id, {
                files: {
                    [q.id]: {
                        label: 'Unggah Jawaban',
                        required: true,
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
