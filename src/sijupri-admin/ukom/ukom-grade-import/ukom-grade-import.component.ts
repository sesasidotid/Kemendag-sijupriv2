import { Component, signal, ViewChild } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-ukom-grade-import',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-grade-import.component.html',
    styleUrl: './ukom-grade-import.component.scss',
})
export class UkomGradeImportComponent {
    @ViewChild(FileHandlerComponent)
    fileHandler!: FileHandlerComponent

    uploadLoading = signal(false)
    ukomList: Ukom[] = []
    file_grade: string = ''

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
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) { }

    downloadTemplate() {
        this.apiService
            .getDownload(`/api/v1/exam_grade/download`, 'template_grade.xlsx')
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
                    .postData('/api/v1/exam_grade/upload', {
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
