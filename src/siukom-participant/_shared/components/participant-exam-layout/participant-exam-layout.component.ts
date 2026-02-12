import { Component, computed, inject, input, output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
@Component({
    selector: 'app-participant-exam-layout',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './participant-exam-layout.component.html',
    styleUrl: './participant-exam-layout.component.scss',
})
export class ParticipantExamLayoutComponent {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    // Loading state
    loading = input<boolean>(false)
    loadingMessage = input<string>('Memuat soal ujian...')
    // Exam type indicator
    examTypeCode = input<string | null>(null)
    // Saved indicator
    showSavedIndicator = input<boolean>(false)
    savedMessage = input<string>('Jawaban telah disimpan')
    // Back button
    showBackButton = input<boolean>(true)
    backButtonLabel = input<string>('Kembali')
    // Error handling
    criticalError = input<boolean>(false)
    errorMessage = input<string>('')

    showExamTypeIndicator = computed(() => !!this.examTypeCode())
    examTypeDisplayName = computed(() =>
        this.ukomMiscellaneousService.getModuleDisplayName(this.examTypeCode()),
    )

    // Events
    backClicked = output<void>()
    reloadClicked = output<void>()
    onBackClick(): void {
        this.backClicked.emit()
    }
    onReloadClick(): void {
        this.reloadClicked.emit()
    }
}
