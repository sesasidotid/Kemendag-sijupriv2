import { Component, inject, signal, ViewChild } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { TabService } from '@/modules/base/services/tab.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ApiService } from '@/modules/base/services/api.service'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { CommonModule } from '@angular/common'
import { UkomGrade } from '@/modules/ukom/models/ukom-grade'
import { UkomGradeUploadBatchComponent } from './ukom-grade-upload-batch/ukom-grade-upload-batch.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ExamGradeService } from '@/modules/ukom/services/exam-grade.service'
import { UkomGradeImportComponent } from '../ukom-grade-import/ukom-grade-import.component'
import { UkomGradeExportComponent } from '../ukom-grade-export/ukom-grade-export.component'
import { UkomGradeSuratRekomSetupComponent } from './ukom-grade-surat-rekom-setup/ukom-grade-surat-rekom-setup.component'
import { UkomGradeSuratRekomComponent } from '@/sijupri-admin/ukom/ukom-grade-list/ukom-grade-surat-rekom/ukom-grade-surat-rekom.component'
import { UkomGradeService } from '@/modules/ukom/services/ukom-grade.service'
import { TruncateDecimalPipe } from '@/modules/base/pipes/truncate-decimal.pipe'

type UkomGradeTabKey =
    | 'list'
    | 'import'
    | 'export'
    | 'surat-rekom'
    | 'pengaturan-surat-rekom'

@Component({
    selector: 'app-ukom-grade-list',
    standalone: true,
    imports: [
        PagableComponent,
        ModalComponent,
        FileHandlerComponent,
        CommonModule,
        UkomGradeUploadBatchComponent,
        LoadingButtonComponent,
        UkomGradeImportComponent,
        UkomGradeExportComponent,
        UkomGradeSuratRekomSetupComponent,
        UkomGradeSuratRekomComponent,
    ],
    templateUrl: './ukom-grade-list.component.html',
    styleUrl: './ukom-grade-list.component.scss',
    providers: [TruncateDecimalPipe],
})
export class UkomGradeListComponent {
    @ViewChild(FileHandlerComponent) fileHandler: FileHandlerComponent

    examGradeService = inject(ExamGradeService)
    ukomGradeService = inject(UkomGradeService)

    pagable!: Pagable
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    isSubmitLoading$ = new BehaviorSubject<boolean>(false)
    isDeleteLoading$ = new BehaviorSubject<boolean>(false)
    payload: { id: string; file_rekomendasi: string } = {
        id: '',
        file_rekomendasi: '',
    }

    refresh = signal(false)
    activeTab = signal<UkomGradeTabKey>('list')
    isFinishExaminerAssessmentLoading = signal(false)
    isSendGradeToParticipantsLoading = signal(false)
    inputs: FIleHandler = {
        files: {
            file_rekom: { label: 'File Rekomendasi' },
        },
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (key: string, base64Data: string) => {
            switch (key) {
                case 'file_rekom':
                    this.payload.file_rekomendasi = base64Data
                    break
            }
        },
    }

    isModalUploadBatchOpen$ = new BehaviorSubject<boolean>(false)
    truncateDecimalPipe = inject(TruncateDecimalPipe)

    constructor(
        private tabService: TabService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private apiService: ApiService,
    ) {}

    ngOnInit() {
        this.handlePagable()
        this.handleTabService()
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/ukom_grade/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'participantName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Kelas', 'roomUkomName').build(),
            )

            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor CAT', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.catGradeScore,
                        )
                    })
                    .build(),
            )

            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Wawancara', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.wawancaraGradeScore,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Seminar', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.seminarGradeScore,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Praktik', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.praktikGradeScore,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Portofolio', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.portofolioGradeScore,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Studi Kasus', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.studiKasusGradeScore,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('UKT', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.ukt)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB CAT', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.nbCat)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Wawancara', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.nbWawancara,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Seminar', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.nbSeminar,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Praktik', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.nbPraktik,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Studi Kasus', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.nbStudiKasus,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Portofolio', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(
                            item.nbPortofolio,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB UKT', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.nbUkt)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('RUKMSK', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.score)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('UKMSK', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.jpm)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB UKMSK', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.ukmsk)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Nilai Akhir', (item: UkomGrade) => {
                        return this.truncateDecimalPipe.transform(item.grade)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status')
                    .withCellClass((row: UkomGrade) => {
                        if (!row.rekomendasi) {
                            return ''
                        }
                        return row.passed
                            ? 'bg-success text-white fw-bold'
                            : 'bg-danger text-white'
                    })
                    .build(),
            )

            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('participantUkom|nip')
                    .withField('NIP', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('participantUkom|name')
                    .withField('Nama', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('roomUkom|name')
                    .withField('Kelas', 'text')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((participantUkom: UkomGrade) => {
                        this.payload = {
                            id: participantUkom.participantId,
                            file_rekomendasi: '',
                        }

                        this.inputs.files['file_rekom'].fileName =
                            participantUkom.rekomendasi
                        this.inputs.files['file_rekom'].source =
                            participantUkom.rekomendasiUrl

                        this.toggleModal()
                    }, 'primary')
                    .withIcon('upload')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: UkomGrade) => {
                        this.onDelete(item.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Daftar Nilai Ukom',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.setActiveTab('list'),
            })
            .addTab({
                label: 'Import Nilai',
                isActive: false,
                icon: 'mdi-plus-circle',
                onClick: () => this.setActiveTab('import'),
            })
            .addTab({
                label: 'Export Nilai',
                isActive: false,
                icon: 'mdi-export',
                onClick: () => this.setActiveTab('export'),
            })
            .addTab({
                label: 'Draft Surat Rekomendasi',
                isActive: false,
                icon: 'mdi-email-seal-outline',
                onClick: () => this.setActiveTab('surat-rekom'),
            })
            .addTab({
                label: 'Pengaturan Surat Rekomendasi',
                isActive: false,
                icon: 'mdi-cog-outline',
                onClick: () => this.setActiveTab('pengaturan-surat-rekom'),
            })
    }

    setActiveTab(tab: UkomGradeTabKey) {
        this.activeTab.set(tab)

        const tabIndex: Record<UkomGradeTabKey, number> = {
            list: 0,
            import: 1,
            export: 2,
            'surat-rekom': 3,
            'pengaturan-surat-rekom': 4,
        }

        this.tabService.changeTabActive(tabIndex[tab])
    }

    toggleModal() {
        const isClosing = this.isModalOpen$.value
        this.isModalOpen$.next(!isClosing)

        if (isClosing) {
            this.inputs.files['file_rekom'].fileName = undefined
            this.inputs.files['file_rekom'].source = undefined
            this.payload = {
                id: '',
                file_rekomendasi: '',
            }
        }
    }

    onDelete(id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isDeleteLoading$.next(true)
                this.apiService
                    .deleteData(`/api/v1/ukom_grade/${id}`)
                    .subscribe({
                        next: () => {
                            this.isDeleteLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus nilai',
                            )
                            this.refreshPagable()
                        },
                        error: (err) => {
                            this.isDeleteLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus nilai',
                            )
                        },
                    })
            },
        })
    }

    onSubmit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isSubmitLoading$.next(true)
                this.apiService
                    .postData(
                        '/api/v1/participant_ukom/upload_rekomendasi',
                        this.payload,
                    )
                    .subscribe({
                        next: () => {
                            this.isSubmitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengunggah rekomendasi',
                            )
                            this.toggleModal()
                            this.refreshPagable()
                        },
                        error: (err) => {
                            console.error('Error uploading rekomendasi:', err)
                            this.isSubmitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengunggah rekomendasi',
                            )
                        },
                    })
            },
        })
    }

    handleOpenBatchUploadModal() {
        this.isModalUploadBatchOpen$.next(true)
    }

    handleCloseBatchUploadModal() {
        this.isModalUploadBatchOpen$.next(false)
    }

    refreshPagable() {
        this.refresh.set(!this.refresh())
    }

    finishExaminerAssessment() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isFinishExaminerAssessmentLoading.set(true)

                this.examGradeService
                    .finishExaminerGradeByAdmin()
                    .pipe(
                        finalize(() => {
                            this.isFinishExaminerAssessmentLoading.set(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menyelesaikan penilaian penguji',
                            )
                            this.refreshPagable()
                        },
                        error: (err) => {
                            console.error('Error uploading rekomendasi:', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyelesaikan penilaian penguji',
                            )
                        },
                    })
            },
        })
    }

    sendGradeToParticipants() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isSendGradeToParticipantsLoading.set(true)

                this.ukomGradeService
                    .sendGradeToParticipantsByAdmin()
                    .pipe(
                        finalize(() => {
                            this.isSendGradeToParticipantsLoading.set(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengirim nilai ke peserta',
                            )
                            this.refreshPagable()
                        },
                        error: (err) => {
                            console.error(
                                'Error sending grade to participants:',
                                err,
                            )
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengirim nilai ke peserta',
                            )
                        },
                    })
            },
        })
    }
}
