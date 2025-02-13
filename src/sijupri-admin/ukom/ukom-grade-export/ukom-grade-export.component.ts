import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { TabService } from '../../../modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { ApiService } from '../../../modules/base/services/api.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ReportGenerate } from '../../../modules/report/models/report-generate.model'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { BehaviorSubject } from 'rxjs'
@Component({
  selector: 'app-ukom-grade-export',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PagableComponent],
  templateUrl: './ukom-grade-export.component.html',
  styleUrl: './ukom-grade-export.component.scss'
})
export class UkomGradeExportComponent {
  exportGradeForm!: FormGroup
  pagable: Pagable
  reportId: string = 'ukomGrade'
  refresh: boolean = false
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  @ViewChild(PagableComponent) pagableComponent!: PagableComponent
  constructor (
    private router: Router,
    private tabService: TabService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService
  ) {
    this.exportGradeForm = new FormGroup({
      dateFrom: new FormControl('', [Validators.required]),
      dateTo: new FormControl('', [Validators.required]),
      fileType: new FormControl('', [Validators.required])
    })

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
                    'File di download'
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
                        'File berhasil dihapus'
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
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'List Nilai Ukom',
        isActive: false,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list`])
      })
      .addTab({
        label: 'Import Nilai',
        isActive: false,
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list/import`])
      })
      .addTab({
        label: 'Export Nilai',
        isActive: true,
        icon: 'mdi-export',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list/export`])
      })
  }

  submit () {
    this.exportGradeForm.markAllAsTouched()

    if (!this.exportGradeForm.valid) {
      //   return
      this.handlerService.handleAlert('Error', 'Data tidak valid')
      return
    }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) {
          return
        }

        this.isLoading$.next(true)
        console.log('exportGradeForm', this.exportGradeForm.value)

        const reportGenerate = new ReportGenerate()
        reportGenerate.reportId = 'ukomGrade'
        reportGenerate.fileType = this.exportGradeForm.value.fileType

        reportGenerate.parameter = {
          dateFrom: this.exportGradeForm.value.dateFrom,
          dateTo: this.exportGradeForm.value.dateTo
        }

        this.apiService
          .postData('/api/v1/report_generate', reportGenerate)
          .subscribe({
            next: () => {
              this.refresh = !this.refresh
              this.handlerService.handleAlert(
                'Success',
                'Berhasil mengexport data'
              )
              this.isLoading$.next(false)
            },
            error: error => {
              console.error('Error generating report', error)
              this.handlerService.handleAlert(
                'Error',
                'Gagal mengexport data. Silahkan Coba Lagi'
              )
              this.isLoading$.next(false)
            }
          })
      }
    })
  }
}
