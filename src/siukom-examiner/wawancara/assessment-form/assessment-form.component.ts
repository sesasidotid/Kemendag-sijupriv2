import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

interface Question {
    id: number
    text: string
    answerKeyUrl: string
    candidateAnswer: string
    assessment?: 'competent' | 'not_competent'
}

@Component({
    selector: 'app-assessment-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './assessment-form.component.html',
    styleUrls: ['./assessment-form.component.scss'],
})
export class AssessmentFormComponent implements OnInit {
    questions: Question[] = []

    constructor() {}

    ngOnInit(): void {
        this.questions = [
            {
                id: 1,
                text: 'Apa yang dimaksud dengan integritas dalam konteks pekerjaan ASN?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 2,
                text: 'Jelaskan langkah-langkah yang Anda ambil ketika menghadapi konflik kepentingan!',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 3,
                text: 'Bagaimana cara Anda memastikan pelayanan publik yang prima kepada masyarakat?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 4,
                text: 'Sebutkan indikator utama keberhasilan dalam sebuah proyek tim yang Anda pimpin!',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 5,
                text: 'Apa strategi Anda untuk beradaptasi dengan perubahan teknologi digital di tempat kerja?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 6,
                text: 'Bagaimana Anda menangani bawahan yang kinerjanya menurun drastis?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 7,
                text: 'Ceritakan pengalaman Anda dalam mengambil keputusan sulit di bawah tekanan waktu.',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 8,
                text: 'Apa yang Anda ketahui tentang core values BerAKHLAK?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 9,
                text: 'Bagaimana cara Anda menjaga kerahasiaan data negara?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
            {
                id: 10,
                text: 'Apa motivasi terbesar Anda mengikuti seleksi kompetensi ini?',
                answerKeyUrl: 'https://google.com',
                candidateAnswer: '',
            },
        ]
    }

    isFormValid(): boolean {
        return this.questions.every((q) => q.assessment !== undefined)
    }

    submitAssessment(): void {
        // TODO: Implement API submission
        console.log('Submitting Assessment:', this.questions)
        alert('Penilaian disimpan (Simulasi)')
    }
}
