import { inject, Injectable, WritableSignal } from '@angular/core'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { ScoreValue } from '@/modules/ukom/models/cat/score-value.type'
import {
    CATScore,
    MakalahScore,
    PortofolioScore,
    PraktikScore,
    StudiKasusScore,
} from '@/modules/ukom/models/exam/exam-score.model'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'

/**
 * Configuration for starting an exam, including confirmation dialog settings
 */
export interface StartExamConfig {
    withComment: boolean
    title: string
    message: string
    commentLabel?: string
    placeholder?: string
}

/**
 * Service responsible for handling exam-type-specific logic and mappings.
 * Centralizes exam route configuration, confirmation dialogs, and score instantiation.
 *
 * @Injectable providedIn: 'root' - singleton service available throughout the application
 */
@Injectable({
    providedIn: 'root',
})
export class ExamTypeHandlerService {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    /**
     * Map of exam types to their corresponding route paths
     */
    private readonly EXAM_ROUTE_MAP: Record<string, string> = {
        [ExamTypeCategory.CAT]: 'cat',
        [ExamTypeCategory.MAKALAH]: 'seminar-paper',
        [ExamTypeCategory.WAWANCARA]: 'interviews',
        [ExamTypeCategory.STUDI_KASUS]: 'case-study',
        [ExamTypeCategory.PORTOFOLIO]: 'portfolio',
        [ExamTypeCategory.PRAKTIK]: 'practical-work',
    }

    /**
     * Get the start exam configuration based on exam type
     *
     * @param examType - The type of exam (CAT, MAKALAH, WAWANCARA)
     * @returns Configuration object for the start exam confirmation dialog
     */
    getStartExamConfig(examType: ExamTypeCategory): StartExamConfig {
        const moduleName =
            this.ukomMiscellaneousService.getModuleDisplayName(examType)

        const baseConfig: StartExamConfig = {
            withComment: false,
            title: `Konfirmasi Mulai ${moduleName}`,
            message: `Anda akan memulai ujian ${moduleName}. Pastikan semua persiapan sudah selesai.`,
        }

        switch (examType) {
            case ExamTypeCategory.CAT:
            case ExamTypeCategory.STUDI_KASUS:
                return {
                    ...baseConfig,
                    withComment: true,
                    message: `Anda akan memulai ujian ${moduleName}. Silakan masukkan kode ujian untuk melanjutkan. Pastikan semua persiapan sudah selesai.`,
                    commentLabel: 'Kode Ujian',
                    placeholder: 'Masukkan kode ujian di sini...',
                }

            default:
                return baseConfig
        }
    }

    /**
     * Get the route path for a specific exam type
     *
     * @param examType - The type of exam
     * @returns The route path string, or undefined if not found
     */
    getRoute(examType: ExamTypeCategory): string | undefined {
        return this.EXAM_ROUTE_MAP[examType]
    }

    /**
     * Get the appropriate loading signal for a specific exam type
     *
     * @param examType - The type of exam
     * @param loadingSignals - Object containing all loading signals
     * @returns The corresponding WritableSignal for the exam type
     */
    getLoadingSignal(
        examType: ExamTypeCategory,
        loadingSignals: {
            startCATLoading: WritableSignal<boolean>
            startMakalahLoading: WritableSignal<boolean>
            startWawancaraLoading: WritableSignal<boolean>
            startPraktikLoading: WritableSignal<boolean>
            startStudiKasusLoading: WritableSignal<boolean>
            startPortofolioLoading: WritableSignal<boolean>
        },
    ): WritableSignal<boolean> | undefined {
        const LOADING_MAP: Record<string, WritableSignal<boolean>> = {
            [ExamTypeCategory.CAT]: loadingSignals.startCATLoading,
            [ExamTypeCategory.MAKALAH]: loadingSignals.startMakalahLoading,
            [ExamTypeCategory.WAWANCARA]: loadingSignals.startWawancaraLoading,
            [ExamTypeCategory.PRAKTIK]: loadingSignals.startPraktikLoading,
            [ExamTypeCategory.STUDI_KASUS]:
                loadingSignals.startStudiKasusLoading,
            [ExamTypeCategory.PORTOFOLIO]:
                loadingSignals.startPortofolioLoading,
        }

        return LOADING_MAP[examType]
    }

    /**
     * Create a typed score instance based on exam type
     *
     * @param examType - The type of exam
     * @param response - The raw response data from the API
     * @returns A typed ScoreValue instance (CATScore, MakalahScore) or null
     */
    createScore(examType: ExamTypeCategory, response: any): ScoreValue | null {
        if (!response) {
            return null
        }

        switch (examType) {
            case ExamTypeCategory.CAT:
                return new CATScore(response)
            case ExamTypeCategory.MAKALAH:
                return new MakalahScore(response)
            case ExamTypeCategory.WAWANCARA:
                return new MakalahScore(response)
            case ExamTypeCategory.PRAKTIK:
                return new PraktikScore(response)
            case ExamTypeCategory.STUDI_KASUS:
                return new StudiKasusScore(response)
            case ExamTypeCategory.PORTOFOLIO:
                return new PortofolioScore(response)

            default:
                return response
        }
    }
}
