import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

interface AssessmentComponent {
    id: number
    name: string
    note: string
    assessment?: 'competent' | 'not_competent'
}

@Component({
    selector: 'app-seminer-makalah',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './seminer-makalah.component.html',
    styleUrls: ['./seminer-makalah.component.scss'],
})
export class SeminerMakalahComponent implements OnInit {
    paperUrl: string = 'https://link-to-dummy-paper.pdf' // Dummy URL
    assessmentComponents: AssessmentComponent[] = []

    constructor() {}

    ngOnInit(): void {
        // Dummy Data
        this.assessmentComponents = [
            {
                id: 1,
                name: 'Sistematika Penulisan',
                note: '',
            },
            {
                id: 2,
                name: 'Kesesuaian Tema dengan Isi Makalah',
                note: '',
            },
            {
                id: 3,
                name: 'Ketajaman Analisis Masalah',
                note: '',
            },
            {
                id: 4,
                name: 'Inovasi dan Solusi yang Ditawarkan',
                note: '',
            },
            {
                id: 5,
                name: 'Kelayakan Implementasi Gagasan',
                note: '',
            },
            {
                id: 6,
                name: 'Kemampuan Mempertahankan Argumen',
                note: '',
            },
        ]
    }

    openPaper(): void {
        window.open(this.paperUrl, '_blank')
    }

    isFormValid(): boolean {
        // It's valid if all components have an assessment (or maybe not required if they can leave it empty?
        // "Silahkan kosongkan apabila ada tidak melakukan penilaian" implies optionality.
        // But typically for an assessment system, if they evaluate, they must complete it.
        // Let's assume for now they must pick competent/not competent if they fill the note?
        // User instruction: "Silahkan kosongkan apabila ada tidak melakukan penilaian"
        // This might mean the user can skip the ENTIRE assessment if they are not the one assessing this part,
        // OR they can skip specific rows.
        // Let's assume validation is loose for now or only validates if they start interacting.
        // Implementation: Check if AT LEAST ONE field is filled? Or just let them save.
        // I will allow saving anytime for now, or maybe check if they filled at least one.
        return true
    }

    submitAssessment(): void {
        const filledComponents = this.assessmentComponents.filter(
            (c) => c.assessment || c.note,
        )
        console.log('Submitting Assessment:', filledComponents)
        alert('Penilaian Seminar disimpan (Simulasi)')
    }
}
