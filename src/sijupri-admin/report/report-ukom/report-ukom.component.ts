import { Component, ViewChild } from '@angular/core'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { ReportGenerate } from '../../../modules/report/models/report-generate.model'
@Component({
  selector: 'app-report-ukom',
  standalone: true,
  imports: [PagableComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './report-ukom.component.html',
  styleUrl: './report-ukom.component.scss'
})
export class ReportUkomComponent {
  pagable: Pagable

  addUKomReportForm!: FormGroup

  reportId: string = 'ukomReport'

  @ViewChild(PagableComponent) pagableComponent!: PagableComponent

  constructor (
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService,
    private apiService: ApiService
  ) {
    this.pagable = new PagableBuilder('/api/v1/report/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'fileName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Tipe', 'fileType').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Status', 'status').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((report: any) => {
            this.apiService
              .postDownload(
                '/api/v1/report/download',
                { id: report.id, bucketId: 'report' },
                report.fileName
              )
              .subscribe({
                next: () =>
                  this.handlerService.handleAlert(
                    'Success',
                    'file di download'
                  ),
                error: error => this.handlerService.handleException(error)
              })
          }, 'success')
          .withIcon('download')
          .addInactiveCondition((report: any) => {
            return report.status == 'FAILED'
          })
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((report: any) => {
            this.confirmationService.open(false).subscribe({
              next: result => {
                if (!result.confirmed) return
                this.apiService
                  .deleteData(`/api/v1/report/${report.id}`)
                  .subscribe({
                    next: () => {
                      this.handlerService.handleAlert(
                        'Success',
                        'report berhasil dihapus'
                      )
                      this.pagableComponent.fetchData()
                    },
                    error: error => this.handlerService.handleException(error)
                  })
              }
            })
          }, 'danger')
          .withIcon('danger')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('fileName')
          .withField('Nama', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('fileType')
          .withField('Tipe', 'select')
          .setOptionList([
            { label: 'Excel', value: 'xlsx' },
            { label: 'CSV', value: 'csv' }
          ])
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('reportId')
          .withDefaultValue(this.reportId)
          .build()
      )
      .setLimit(5)
      .build()
  }

  ngOnInit () {
    this.addUKomReportForm = new FormGroup({
      dateFrom: new FormControl('', [Validators.required]),
      dateTo: new FormControl('', [Validators.required]),
      fileType: new FormControl('', [Validators.required])
    })
  }

  onSubmit () {
    this.addUKomReportForm.markAllAsTouched()

    if (this.addUKomReportForm.valid) {
      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) return

          const reportGenerate = new ReportGenerate()
          reportGenerate.reportId = 'ukomReport'
          reportGenerate.fileType = this.addUKomReportForm.value.fileType
          reportGenerate.parameter = {
            dateFrom: this.addUKomReportForm.value.dateFrom,
            dateTo: this.addUKomReportForm.value.dateTo
          }

          this.apiService
            .postData('/api/v1/report_generate', reportGenerate)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert('Success', 'Report Generating')
                this.pagableComponent.fetchData()
                this.ngOnInit()
              },
              error: error => {
                console.error('Error generating report', error)
                this.handlerService.handleAlert(
                  'Error',
                  'Gagal membuat report. Silahkan Coba Lagi'
                )
              }
            })
        }
      })
    }
  }
}
