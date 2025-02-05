import { Component, ViewChild } from '@angular/core'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { CommonModule } from '@angular/common'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { ReportGenerate } from '../../../modules/report/models/report-generate.model'

@Component({
  selector: 'app-report-akp',
  standalone: true,
  imports: [PagableComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './report-akp.component.html',
  styleUrl: './report-akp.component.scss'
})
export class ReportAkpComponent {
  pagable: Pagable

  addAkpReportForm!: FormGroup

  unitKerjaList: UnitKerja[]

  reportId: string = 'akpReport'

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
    this.apiService.getData('/api/v1/unit_kerja').subscribe({
      next: (response: any) => {
        this.unitKerjaList = response.map(
          (unitKerja: { [key: string]: any }) => new UnitKerja(unitKerja)
        )
      },
      error: error => {
        this.handlerService.handleException(error)
      }
    })

    this.addAkpReportForm = new FormGroup({
      unitKerjaId: new FormControl('', [Validators.required]),
      unitKerjaName: new FormControl('', [Validators.required]),
      dateFrom: new FormControl('', [Validators.required]),
      dateTo: new FormControl('', [Validators.required]),
      fileType: new FormControl('', [Validators.required])
    })
  }

  onUnitKerjaChange (event: Event) {
    const unitKerjaId = (event.target as HTMLSelectElement).value
    this.unitKerjaList.forEach(unitKerja => {
      if (unitKerja.id == unitKerjaId) {
        this.addAkpReportForm.get('unitKerjaId').setValue(unitKerja.id)
        this.addAkpReportForm.get('unitKerjaName').setValue(unitKerja.name)
      }
    })
  }

  onSubmit () {
    this.addAkpReportForm.markAllAsTouched()
    if (this.addAkpReportForm.valid) {
      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) return

          const reportGenerate = new ReportGenerate()
          reportGenerate.reportId = this.reportId
          reportGenerate.fileType = this.addAkpReportForm.value.fileType
          reportGenerate.parameter = {
            unitKerjaId: this.addAkpReportForm.value.unitKerjaId,
            unitKerjaName: this.addAkpReportForm.value.unitKerjaName,
            dateFrom: this.addAkpReportForm.value.dateFrom,
            dateTo: this.addAkpReportForm.value.dateTo
          }

          this.apiService
            .postData('/api/v1/report_generate/async', reportGenerate)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert('Success', 'Report Generating')
                this.pagableComponent.fetchData()
                this.ngOnInit()
              }
            })
        }
      })
    }
  }
}
