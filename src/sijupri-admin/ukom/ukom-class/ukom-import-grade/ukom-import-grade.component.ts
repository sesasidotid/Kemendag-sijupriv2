import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { TabService } from '@/modules/base/services/tab.service'
import { Ukom } from '@/modules/ukom/models/ukom.model'
import { CommonModule } from '@angular/common'
import { Component, OnInit, OnDestroy, signal, ViewChild } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { finalize, take } from 'rxjs'

@Component({
    selector: 'app-ukom-import-grade',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-import-grade.component.html',
    styleUrl: './ukom-import-grade.component.scss',
})
export class UkomImportGradeComponent implements OnInit, OnDestroy {
    @ViewChild(FileHandlerComponent)
    fileHandler!: FileHandlerComponent

    uploadLoading = signal(false)
    ukomList: Ukom[] = []
    file_grade: string = ''
    roomUkomId: string = ''

    inputs: FIleHandler = {
        files: {
            file_grade: { label: 'File Nilai Ukom' },
        },
        allowedTypes: [
            { label: 'xls', type: 'application/vnd.ms-excel' },
            {
                label: 'xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],

        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
        ) => {
            switch (key) {
                case 'file_grade':
                    this.file_grade = base64Data
                    break
            }
        },
    }

    constructor(
        private tabService: TabService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe((params) => {
            this.roomUkomId = params.get('id')
        })
        this.handleTabService()
    }

    ngOnDestroy() {
        this.tabService.clearTabs()
    }

    downloadTemplate() {
        this.apiService
            .getDownload(
                `/api/v1/ukom_grade/download`,
                'template_grade_class.xlsx',
            )
            .subscribe({
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengunduh template',
                    )
                },
            })
    }

    handleTabService() {
        this.tabService.clearTabs()

        this.tabService
            .addTab({
                label: 'Detail Kelas',
                icon: 'mdi-list-box',
                isActive: false,
                onClick: () => this.handleDetailTabChange(),
            })
            .addTab({
                label: 'Tambah Jadwal UKom',
                icon: 'mdi-plus-circle',
                isActive: false,
                onClick: () => this.handleTabChange(),
            })
            .addTab({
                label: 'Import Nilai UKom',
                icon: 'mdi-plus-circle',
                isActive: true,
                onClick: () => {},
            })

        this.tabService.changeTabActive(2)
    }

    handleDetailTabChange() {
        this.router.navigate(['/ukom/ukom-room-list', this.roomUkomId], {
            replaceUrl: true,
        })
    }

    handleTabChange() {
        this.router.navigate(
            ['/ukom/ukom-room-list', this.roomUkomId, 'add-ukom-schedule'],
            {
                replaceUrl: true,
            },
        )
    }

    resetInput() {
        this.file_grade = ''
        this.fileHandler.clearFileName()
    }
    submit() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.uploadLoading.set(true)

                this.apiService
                    .postData(`/api/v1/ukom_grade/${this.roomUkomId}/import-grade`, {
                        file_grade: this.file_grade,
                    })
                    .pipe(finalize(() => this.uploadLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.resetInput()
                            this.handlerService.handleAlert(
                                'Info',
                                'Data berhasil diimport',
                            )
                        },
                        error: (error) => {
                            console.error(error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengimport data',
                            )
                        },
                    })
            },
        })
    }
}
