import { Component, ViewChild } from '@angular/core'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ApiService } from '@/modules/base/services/api.service'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ReportGenerate } from '@/modules/report/models/report-generate.model'
import { BehaviorSubject, finalize } from 'rxjs'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { ReportService } from '@/modules/report/services/report.service'
import { ReportModel } from '@/modules/report/models/report.model'
import { ReportDownloadModel } from '@/modules/report/models/report-download.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
@Component({
    selector: 'app-report-ukom-cat',
    standalone: true,
    imports: [
        PagableComponent,
        ReactiveFormsModule,
        CommonModule,
        LoadingButtonComponent,
    ],
    templateUrl: './report-ukom-cat.component.html',
    styleUrl: './report-ukom-cat.component.scss',
})
export class ReportUkomCatComponent {
    isLoading$ = new BehaviorSubject<boolean>(false)
    refresh = false
    pagable: Pagable
    addReportCAT: FormGroup

    reportId = 'ukomCatReport'

    constructor(
        private fb: FormBuilder,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        private reportService: ReportService,
    ) {}

    ngOnInit() {
        this.handlePagable()
        this.handleFormInit()
    }

    getErrorMessage(controlName: string, label: string) {
        const control = this.addReportCAT.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.addReportCAT = this.fb.group({
            dateFrom: ['', [Validators.required]],
            dateTo: ['', [Validators.required]],
            fileType: ['', [Validators.required]],
        })
    }

    handleDownloadReport(report: ReportModel) {
        const body = new ReportDownloadModel({
            id: report.id,
            bucketId: 'report',
        })
        this.reportService.downloadReport(body, report.fileName)
    }

    handleDeleteReport(reportId: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.reportService.deleteReport(reportId).subscribe({
                    next: () => {
                        this.refresh = !this.refresh
                    },
                })
            },
        })
    }

    handleGenerateReport() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isLoading$.next(true)
                const formValue = this.addReportCAT.value
                const body = new ReportGenerate({
                    reportId: this.reportId,
                    fileType: formValue.fileType,
                    parameter: {
                        dateFrom: formValue.dateFrom,
                        dateTo: formValue.dateTo,
                    },
                })

                this.reportService
                    .generateReport(body)
                    .pipe(
                        finalize(() => {
                            this.isLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.refresh = !this.refresh
                        },
                        error: (error) => {
                            console.log(error)
                        },
                    })
            },
        })
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
                    .setAction((report: ReportModel) => {
                        this.handleDownloadReport(report)
                    }, 'success')
                    .withIcon('download')
                    .addInactiveCondition((report: ReportModel) => {
                        return report.status == 'FAILED'
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((report: ReportModel) => {
                        this.handleDeleteReport(report.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('fileName')
                    .withField('Nama', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('fileType')
                    .withField('Tipe', 'select')
                    .setOptionList([
                        { label: 'Excel', value: 'xlsx' },
                        { label: 'CSV', value: 'csv' },
                    ])
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
}
