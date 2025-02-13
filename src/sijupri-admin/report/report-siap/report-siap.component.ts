import { CommonModule } from '@angular/common'
import { Component, ViewChild } from '@angular/core'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { ReportGenerate } from '../../../modules/report/models/report-generate.model'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-report-siap',
  standalone: true,
  imports: [PagableComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './report-siap.component.html',
  styleUrl: './report-siap.component.scss'
})
export class ReportSiapComponent {
  pagable: Pagable
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  addSiapReportForm!: FormGroup

  instansiList: Instansi[]
  unitKerjaList: UnitKerja[]
  provinsiList: Provinsi[]
  kabKotaList: KabKota[]

  reportId: string = 'siapReport'

  @ViewChild(PagableComponent) pagableComponent!: PagableComponent

  exportTypeLoading$ = new BehaviorSubject<boolean>(false)

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
    this.getExportTypeData()

    this.addSiapReportForm = new FormGroup({
      exportType: new FormControl(''),
      instansiId: new FormControl(''),
      instansiName: new FormControl(''),
      unitKerjaId: new FormControl(''),
      unitKerjaName: new FormControl(''),
      provinsiId: new FormControl(''),
      provinsiName: new FormControl(''),
      kabKotaId: new FormControl(''),
      kabKotaName: new FormControl(''),
      fileType: new FormControl('', [Validators.required])
    })
  }

  getExportTypeData () {
    this.exportTypeLoading$.next(true)
    let loading: any = [false, false, false, false]

    this.apiService.getData('/api/v1/instansi').subscribe({
      next: (response: any) => {
        this.instansiList = response.map(
          (instansi: { [key: string]: any }) => new Instansi(instansi)
        )
      },
      complete: () => {
        loading[0] = true
        if (!loading.includes(false)) {
          this.exportTypeLoading$.next(false)
        }
      },
      error: error => {
        this.handlerService.handleException(error)
      }
    })

    this.apiService.getData('/api/v1/unit_kerja').subscribe({
      next: (response: any) => {
        this.unitKerjaList = response.map(
          (unitKerja: { [key: string]: any }) => new UnitKerja(unitKerja)
        )
      },
      complete: () => {
        loading[1] = true
        if (!loading.includes(false)) {
          this.exportTypeLoading$.next(false)
        }
      },
      error: error => {
        this.handlerService.handleException(error)
      }
    })

    this.apiService.getData('/api/v1/provinsi').subscribe({
      next: (response: any) => {
        this.provinsiList = response.map(
          (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
        )
      },
      complete: () => {
        loading[2] = true
        if (!loading.includes(false)) {
          this.exportTypeLoading$.next(false)
        }
      },
      error: error => {
        this.handlerService.handleException(error)
      }
    })

    this.apiService.getData('/api/v1/kab_kota').subscribe({
      next: (response: any) => {
        this.kabKotaList = response.map(
          (kabKota: { [key: string]: any }) => new KabKota(kabKota)
        )
      },
      complete: () => {
        loading[3] = true
        if (!loading.includes(false)) {
          this.exportTypeLoading$.next(false)
        }
      },
      error: error => {
        this.handlerService.handleException(error)
      }
    })
  }

  patchFormValue (event: Event, key: string) {
    const id = (event.target as HTMLSelectElement).value
    switch (key) {
      case 'instansi':
        this.instansiList.forEach(instansi => {
          if (instansi.id == id) {
            this.addSiapReportForm.get('instansiName').setValue(instansi.name)
          }
        })
        break
      case 'unitKerja':
        this.unitKerjaList.forEach(unitKerja => {
          if (unitKerja.id == id) {
            this.addSiapReportForm.get('unitKerjaName').setValue(unitKerja.name)
          }
        })
        break
      case 'provinsi':
        this.provinsiList.forEach(provinsi => {
          if (provinsi.id == id) {
            this.addSiapReportForm.get('provinsiName').setValue(provinsi.name)
          }
        })
        break
      case 'kabKota':
        this.kabKotaList.forEach(kabKota => {
          if (kabKota.id == id) {
            this.addSiapReportForm.get('kabKotaName').setValue(kabKota.name)
          }
        })
        break
    }
  }

  onSubmit () {
    if (this.addSiapReportForm.valid) {
      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) return

          this.isLoading$.next(true)
          const reportGenerate = new ReportGenerate()
          reportGenerate.reportId = this.reportId
          reportGenerate.fileType = this.addSiapReportForm.value.fileType
          if (this.addSiapReportForm.value.exportType == '') {
            reportGenerate.parameter = {}
          }
          if (this.addSiapReportForm.value.exportType == 'instansi') {
            reportGenerate.parameter = {
              instansiId: this.addSiapReportForm.value.instansiId,
              instansiName: this.addSiapReportForm.value.instansiName
            }
          }
          if (this.addSiapReportForm.value.exportType == 'unitKerja') {
            reportGenerate.parameter = {
              unitKerjaId: this.addSiapReportForm.value.unitKerjaId,
              unitKerjaName: this.addSiapReportForm.value.unitKerjaName
            }
          }
          if (this.addSiapReportForm.value.exportType == 'provinsi') {
            reportGenerate.parameter = {
              provinsiId: this.addSiapReportForm.value.provinsiId,
              provinsiName: this.addSiapReportForm.value.provinsiName
            }
          }
          if (this.addSiapReportForm.value.exportType == 'kabKota') {
            reportGenerate.parameter = {
              kabKotaId: this.addSiapReportForm.value.kabKotaId,
              kabKotaName: this.addSiapReportForm.value.kabKotaName
            }
          }
          // console.log(reportGenerate);
          this.apiService
            .postData('/api/v1/report_generate/async', reportGenerate)
            .subscribe({
              next: () => {
                this.isLoading$.next(false)
                this.handlerService.handleAlert(
                  'Success',
                  'Generating Report...'
                )
                this.pagableComponent.fetchData()
                this.ngOnInit()
              },
              error: error => {
                console.log(error)
                this.isLoading$.next(false)
                this.handlerService.handleAlert(
                  'Error',
                  'Failed to generate report'
                )
              }
            })
        }
      })
    }
  }
}
