import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ReportGenerate } from '@/modules/report/models/report-generate.model'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { BehaviorSubject } from 'rxjs'

@Component({
    selector: 'app-ukom-export-resignation',
    standalone: true,
    imports: [
        PagableComponent,
        ReactiveFormsModule,
        CommonModule,
        LoadingButtonComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-export-resignation.component.html',
    styleUrl: './ukom-export-resignation.component.scss',
})
export class UkomExportResignationComponent {
    pagable: Pagable
    isLoading$: BehaviorSubject<boolean>
    hasilVerifikasiForm!: FormGroup
    reportId: string
    payload: ReportGenerate
    refresh: boolean

    constructor(
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private apiService: ApiService,
        private formValidationService: FormValidationService,
    ) {
        this.isLoading$ = new BehaviorSubject<boolean>(false)
        this.reportId = 'ukomResignation'
        this.payload = new ReportGenerate()
        this.refresh = false
    }

    ngOnInit() {
        this.handleFormInit()
        this.handlePagable()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.hasilVerifikasiForm.get(controlName),
            controlName,
            label,
        )
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/report/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'fileName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tipe', 'fileType').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((report: any) => {
                        this.handleDownload(report.id, report.fileName)
                    }, 'success')
                    .withIcon('download')
                    .addInactiveCondition((report: any) => {
                        return report.status == 'FAILED'
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((report: any) => {
                        this.handleDelete(report.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('reportId')
                    .withDefaultValue(this.reportId)
                    .build(),
            )
            .setLimit(5)
            .build()
    }

    handleDownload(reportId: string, fileName: string) {
        this.apiService
            .getDownload(`/api/v1/report/download/${reportId}`, fileName)
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'file di download',
                    )
                },
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mendownload file',
                    )
                },
            })
    }

    handleDelete(reportId: string) {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/report/${reportId}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Report berhasil dihapus',
                            )
                            this.refresh = !this.refresh
                        },
                        error: (err) => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus report',
                            )
                        },
                    })
            },
        })
    }

    handleFormInit() {
        this.hasilVerifikasiForm = new FormGroup({
            fileType: new FormControl('', [Validators.required]),
            taskStatus: new FormControl('', [Validators.required]),
            dateFrom: new FormControl(''),
            dateTo: new FormControl(''),
        })
    }

    onSubmit() {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.isLoading$.next(true)
                this.payload.reportId = this.reportId
                this.payload.fileType =
                    this.hasilVerifikasiForm.get('fileType')?.value
                this.payload.parameter = {}

                const addIfTruthy = (key: string, value: any) => {
                    if (value) {
                        this.payload.parameter[key] = value
                    }
                }

                addIfTruthy(
                    'taskStatus',
                    this.hasilVerifikasiForm.get('taskStatus')?.value,
                )
                addIfTruthy(
                    'dateFrom',
                    this.hasilVerifikasiForm.get('dateFrom')?.value ||
                        '2024-01-01',
                )
                addIfTruthy(
                    'dateTo',
                    this.hasilVerifikasiForm.get('dateTo')?.value ||
                        new Date().toISOString().split('T')[0],
                )

                this.apiService
                    .postData('/api/v1/report_generate', this.payload)
                    .subscribe({
                        next: () => {
                            this.isLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Report Generating',
                            )
                            this.refresh = !this.refresh
                            this.hasilVerifikasiForm.reset()
                        },
                        error: (err) => {
                            this.isLoading$.next(false)
                            console.error('Error generating report', err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal membuat report. Silahkan Coba Lagi',
                            )
                        },
                    })
            },
        })
    }
}
