import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

interface CaseStudyItem {
    id: number
    aspect: string
    description: string
    score: number | null
    note: string
}

@Component({
    selector: 'app-studi-kasus',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './studi-kasus.component.html',
    styleUrls: ['./studi-kasus.component.scss'],
})
export class StudiKasusComponent implements OnInit {
    caseStudyAnswerUrl: string = 'https://example.com/jawaban-studi-kasus.pdf' // Dummy URL
    assessmentItems: CaseStudyItem[] = []

    constructor() {}

    ngOnInit(): void {
        // Initialize with the 3 required aspects
        this.assessmentItems = [
            {
                id: 1,
                aspect: 'Landasan Teori/Regulasi',
                description:
                    'Ketepatan penggunaan teori dan regulasi yang relevan dengan kasus.',
                score: null,
                note: '',
            },
            {
                id: 2,
                aspect: 'Analisis Masalah',
                description:
                    'Kemampuan mengidentifikasi akar masalah dan dampaknya secara komprehensif.',
                score: null,
                note: '',
            },
            {
                id: 3,
                aspect: 'Solusi dan Rekomendasi',
                description:
                    'Efektivitas, kebaruan, dan kelayakan solusi yang ditawarkan.',
                score: null,
                note: '',
            },
        ]
    }

    openAnswer(): void {
        window.open(this.caseStudyAnswerUrl, '_blank')
    }

    get finalScore(): number {
        const scoredItems = this.assessmentItems.filter(
            (item) => item.score !== null,
        )
        if (scoredItems.length === 0) return 0

        const total = scoredItems.reduce(
            (sum, item) => sum + (item.score || 0),
            0,
        )
        return Math.round(total / scoredItems.length)
    }

    validateScore(item: CaseStudyItem): void {
        if (item.score !== null) {
            if (item.score < 0) item.score = 0
            if (item.score > 100) item.score = 100
        }
    }

    submitAssessment(): void {
        const hasEmptyScores = this.assessmentItems.some(
            (item) => item.score === null,
        )

        if (hasEmptyScores) {
            if (
                !confirm(
                    'Masih ada aspek yang belum dinilai (Nilai 0). Lanjutkan penyimpanan?',
                )
            ) {
                return
            }
        }

        const payload = {
            items: this.assessmentItems,
            finalScore: this.finalScore,
        }

        console.log('Submitting Case Study Assessment:', payload)
        alert(
            `Penilaian Studi Kasus disimpan.\nNilai Akhir: ${this.finalScore}`,
        )
    }
}
