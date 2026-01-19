import { Component, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MultiFileHandlerComponent } from '@/modules/base/components/multi-file-handler/multi-file-handler.component'
import {
    MultiFileHandler,
    UploadedFile,
} from '@/modules/base/commons/file-handler/multi-file-handler'

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
    imports: [CommonModule, FormsModule, MultiFileHandlerComponent],
    templateUrl: './portfolio-page.component.html',
    styleUrl: './portfolio-page.component.scss',
})
export class PortfolioPageComponent {
    questions = signal(DUMMY_PORTFOLIO_QUESTIONS)

    // Map now holds multiple files (array of UploadedFile) per question
    answerMap = new Map<string, UploadedFile[]>()

    getMultiFileHandlerInputs(q: PortfolioQuestion): MultiFileHandler {
        return {
            files: {
                answer: {
                    label: 'Unggah Jawaban',
                    required: true,
                },
            },
            allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
            maxSize: 2 * 1024 * 1024,
            maxFiles: 3, // Allow up to 10 files per question
            listen: (key: string, files: UploadedFile[]) => {
                this.onFilesUpdated(q.id, files)
            },
        }
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

    submitPortfolio() {
        // Check if all questions have at least one file uploaded
        const questionsWithFiles = this.questions().filter(
            (q) =>
                this.answerMap.has(q.id) &&
                this.answerMap.get(q.id)!.length > 0,
        )

        if (questionsWithFiles.length !== this.questions().length) {
            alert(
                'Silakan unggah setidaknya satu file untuk setiap pertanyaan.',
            )
            return
        }

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
        // TODO: send to API
    }
}
