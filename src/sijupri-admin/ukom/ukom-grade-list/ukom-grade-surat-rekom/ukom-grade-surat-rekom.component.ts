import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import {
    SuratRekomModel,
    SuratRekomStatus,
} from '@/modules/ukom/models/surat-rekom/surat-rekom.model'
import { SuratRekomService } from '@/modules/ukom/services/surat-rekom.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs/operators'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-ukom-grade-surat-rekom',
    standalone: true,
    imports: [PagableComponent, CommonModule, LoadingButtonComponent],
    templateUrl: './ukom-grade-surat-rekom.component.html',
    styleUrl: './ukom-grade-surat-rekom.component.scss',
})
export class UkomGradeSuratRekomComponent implements OnInit {
    suratRekomService = inject(SuratRekomService)
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    pagable: Pagable
    downloadingIds = new Map<string, boolean>()
    refreshPagable = signal(false)

    generateSuratRekomLoading = signal(false)

    ngOnInit() {
        this.initPagable()
    }

    initPagable() {
        this.pagable = new PagableBuilder('/api/v1/surat_rekom/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'fileName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: SuratRekomModel) => {
                        this.handleDownloadRar(data.id)
                    }, 'success')
                    .withIcon('download')
                    .addInactiveCondition((data: SuratRekomModel) => {
                        return (
                            data.status != SuratRekomStatus.FINISHED ||
                            this.isDownloading(data.id)
                        )
                    })
                    .build(),
            )
            .withQueryParams()
            .setLimit(5)
            .build()
    }

    handleDownloadRar(id: string) {
        // Prevent duplicate downloads
        if (this.downloadingIds.get(id)) {
            return
        }

        this.downloadingIds.set(id, true)
        this.handlerService.handleAlert(
            'Info',
            'Download dimulai, mohon tunggu...',
        )

        this.suratRekomService
            .downloadRarSuratRekom(id)
            .pipe(
                finalize(() => {
                    this.downloadingIds.set(id, false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Download berhasil',
                    )
                },
            })
    }

    isDownloading(id: string): boolean {
        return this.downloadingIds.get(id) || false
    }

    hasActiveDownloads(): boolean {
        return Array.from(this.downloadingIds.values()).some(
            (isDownloading) => isDownloading,
        )
    }

    handleGenerateSuratRekom() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.generateSuratRekomLoading.set(true)

                this.suratRekomService
                    .generateSuratRekom()
                    .pipe(
                        finalize(() => {
                            this.generateSuratRekomLoading.set(false)
                            this.refreshPagable.set(!this.refreshPagable())
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Surat rekomendasi berhasil digenerate',
                            )
                        },
                    })
            },
        })
    }
}
