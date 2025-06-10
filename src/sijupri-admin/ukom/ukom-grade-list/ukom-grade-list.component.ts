import { Component, ViewChild } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { CommonModule } from '@angular/common'
import { UkomGrade } from '../../../modules/ukom/models/ukom-grade'
@Component({
    selector: 'app-ukom-grade-list',
    standalone: true,
    imports: [
        PagableComponent,
        ModalComponent,
        FileHandlerComponent,
        CommonModule
    ],
    templateUrl: './ukom-grade-list.component.html',
    styleUrl: './ukom-grade-list.component.scss'
})
export class UkomGradeListComponent {
    @ViewChild(FileHandlerComponent) fileHandler!: FileHandlerComponent

    pagable!: Pagable
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    isSubmitLoading$ = new BehaviorSubject<boolean>(false)

    payload: { id: string; file_rekomendasi: string } = {
        id: '',
        file_rekomendasi: ''
    }

    inputs: FIleHandler = {
        files: {
            file_rekom: { label: 'File Rekomendasi' }
        },
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (key: string, base64Data: string) => {
            switch (key) {
                case 'file_rekom':
                    this.payload.file_rekomendasi = base64Data
                    break
            }
        }
    }

    constructor (
        private router: Router,
        private tabService: TabService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private apiService: ApiService
    ) {}

    ngOnInit () {
        this.handlePagable()
        this.handleTabService()
    }

    clearFilesName () {
        if (this.fileHandler) {
            this.fileHandler.clearFileName()
        }
    }

    handlePagable () {
        this.pagable = new PagableBuilder('/api/v1/ukom_grade/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'participantName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Kelas', 'roomUkomName').build()
            )

            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor CAT', (item: UkomGrade) => {
                        return this.rounding(item.catGradeScore)
                    })
                    .build()
            )

            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Wawancara', (item: UkomGrade) => {
                        return this.rounding(item.wawancaraGradeScore)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Seminar', (item: UkomGrade) => {
                        return this.rounding(item.seminarGradeScore)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Praktik', (item: UkomGrade) => {
                        return this.rounding(item.praktikGradeScore)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor Portofolio', (item: UkomGrade) => {
                        return this.rounding(item.portofolioGradeScore)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('UKT', (item: UkomGrade) => {
                        return this.rounding(item.ukt)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB CAT', (item: UkomGrade) => {
                        return this.rounding(item.nbCat)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Wawancara', (item: UkomGrade) => {
                        return this.rounding(item.nbWawancara)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Seminar', (item: UkomGrade) => {
                        return this.rounding(item.nbSeminar)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Praktik', (item: UkomGrade) => {
                        return this.rounding(item.nbPraktik)
                    })
                    .build()
            )

            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB Portofolio', (item: UkomGrade) => {
                        return this.rounding(item.nbPortofolio)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('NB UKT', (item: UkomGrade) => {
                        return this.rounding(item.nbUkt)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('JPM', (item: UkomGrade) => {
                        return this.rounding(item.jpm)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Skor', (item: UkomGrade) => {
                        return this.rounding(item.score)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('UKMSK', (item: UkomGrade) => {
                        return this.rounding(item.ukmsk)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Nilai Akhir', (item: UkomGrade) => {
                        return this.rounding(item.grade)
                    })
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status').build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('participantUkom|nip')
                    .withField('NIP', 'text')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('participantUkom|name')
                    .withField('Nama', 'text')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('roomUkom|name')
                    .withField('Kelas', 'text')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((participantUkom: UkomGrade) => {
                        this.clearFilesName()
                        this.payload = {
                            id: participantUkom.id,
                            file_rekomendasi: ''
                        }
                        this.toggleModal()
                    }, 'primary')
                    .withIcon('update')
                    .build()
            )
            .build()
    }

    handleTabService () {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'List Nilai Ukom',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.router.navigate([`/ukom/ukom-grade-list`])
            })
            .addTab({
                label: 'Import Nilai',
                isActive: false,
                icon: 'mdi-plus-circle',
                onClick: () =>
                    this.router.navigate([`/ukom/ukom-grade-list/import`])
            })
            .addTab({
                label: 'Export Nilai',
                isActive: false,
                icon: 'mdi-export',
                onClick: () =>
                    this.router.navigate([`/ukom/ukom-grade-list/export`])
            })
    }

    toggleModal () {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    rounding (value: string | number): string {
        return parseFloat(value.toString()).toFixed(2)
    }

    onSubmit () {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isSubmitLoading$.next(true)
                this.apiService
                    .postData(
                        '/api/v1/participant_ukom/upload_rekomendasi',
                        this.payload
                    )
                    .subscribe({
                        next: () => {
                            this.isSubmitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengunggah rekomendasi'
                            )
                            this.isModalOpen$.next(false)
                            this.payload = {
                                id: '',
                                file_rekomendasi: ''
                            }
                        },
                        error: err => {
                            console.error('Error uploading rekomendasi:', err)
                            this.isSubmitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengunggah rekomendasi'
                            )
                        }
                    })
            }
        })
    }
}
