import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'

interface PortfolioItem {
    id: number
    competency: string
    assessmentAspect: string
    documentUrl: string
    documentName: string
    examinerNote: string
    isValid: boolean
    isAdequate: boolean
}

@Component({
    selector: 'app-portofolio',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './portofolio.component.html',
    styleUrls: ['./portofolio.component.scss'],
})
export class PortofolioComponent implements OnInit {
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)

    examinerName: string = 'Budi Santoso, S.Kom., M.T.' // Dummy Examiner Name
    portfolioItems: PortfolioItem[] = []

    constructor() {}

    ngOnInit(): void {
        this.portfolioItems = [
            {
                id: 1,
                competency: 'Manajemen Data dan Informasi',
                assessmentAspect:
                    'Kemampuan mengelola siklus hidup data organisasi',
                documentUrl: 'https://example.com/doc1.pdf',
                documentName: 'Laporan_Pengelolaan_Data_2024.pdf',
                examinerNote: '',
                isValid: false,
                isAdequate: false,
            },
            {
                id: 2,
                competency: 'Keamanan Informasi',
                assessmentAspect: 'Penerapan standar keamanan ISO 27001',
                documentUrl: 'https://example.com/doc2.pdf',
                documentName: 'Sertifikat_Internal_Security_Audit.pdf',
                examinerNote: '',
                isValid: false,
                isAdequate: false,
            },
            {
                id: 3,
                competency: 'Manajemen Layanan TI',
                assessmentAspect: 'Evaluasi kualitas layanan berdasarkan SLA',
                documentUrl: 'https://example.com/doc3.pdf',
                documentName: 'Bukti_Dukung_SLA_Q1.pdf',
                examinerNote: '',
                isValid: false,
                isAdequate: false,
            },
            {
                id: 4,
                competency: 'Manajemen Risiko TI',
                assessmentAspect:
                    'Identifikasi dan mitigasi risiko operasional',
                documentUrl: 'https://example.com/doc4.pdf',
                documentName: 'Risk_Assessment_Report.pdf',
                examinerNote: '',
                isValid: false,
                isAdequate: false,
            },
            {
                id: 5,
                competency: 'Perencanaan Strategis TI',
                assessmentAspect: 'Penyusunan Roadmap TI 5 Tahunan',
                documentUrl: 'https://example.com/doc5.pdf',
                documentName: 'IT_Master_Plan_2025-2030.pdf',
                examinerNote: '',
                isValid: false,
                isAdequate: false,
            },
        ]
    }

    openDocument(url: string): void {
        window.open(url, '_blank')
    }

    isItemCompetent(item: PortfolioItem): boolean {
        return item.isValid && item.isAdequate
    }

    // Optional: Overall form validation logic if needed
    canSubmit(): boolean {
        // Maybe require all items to be checked? Or just allow partial?
        // For now, allow submit anytime
        return true
    }

    submitAssessment(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.handlerService.handleAlert(
                    'Success',
                    'Penilaian Portofolio disimpan (Simulasi)',
                )
            },
        })
    }
}
