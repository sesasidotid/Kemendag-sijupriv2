import { Component, ViewChild } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { CommonModule } from '@angular/common'
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
import { Observable } from 'rxjs'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { map, filter } from 'rxjs/operators'
import { BehaviorSubject } from 'rxjs'
import { ReportGenerate } from '../../../modules/report/models/report-generate.model'

@Component({
  selector: 'app-report-formasi',
  standalone: true,
  imports: [
    PagableComponent,
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './report-formasi.component.html',
  styleUrl: './report-formasi.component.scss'
})
export class ReportFormasiComponent {
  pagable: Pagable

  addFormasiReportForm!: FormGroup

  reportId: string = 'formasiReport'

  //   provinsiList$: Observable<Provinsi[]>
  //   kabKotaList$: Observable<KabKota[]>
  //   unitKerjaList$: Observable<UnitKerja[]>

  unitKerjaList: UnitKerja[]
  provinsiList: Provinsi[]
  kabKotaList: KabKota[]
  exportTypeLoading$ = new BehaviorSubject<boolean>(false)

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

    // this.addFormasiReportForm = new FormGroup({
    //   provinsi: new FormControl('', Validators.required),
    //   kabKota: new FormControl(''),
    //   unitKerja: new FormControl('')
    // })

    this.addFormasiReportForm = new FormGroup({
      exportType: new FormControl(''),
      unitKerjaId: new FormControl(''),
      unitKerjaName: new FormControl(''),
      provinsiId: new FormControl(''),
      provinsiName: new FormControl(''),
      kabKotaId: new FormControl(''),
      kabKotaName: new FormControl(''),
      fileType: new FormControl('', [Validators.required])
    })
  }

  ngOnInit () {
    // this.getListProvinsi()
    this.getExportTypeData()
  }

  patchFormValue (event: Event, key: string) {
    const id = (event.target as HTMLSelectElement).value
    switch (key) {
      case 'unitKerja':
        this.unitKerjaList.forEach(unitKerja => {
          if (unitKerja.id == id) {
            this.addFormasiReportForm
              .get('unitKerjaName')
              .setValue(unitKerja.name)
          }
        })
        break
      case 'provinsi':
        this.provinsiList.forEach(provinsi => {
          if (provinsi.id == id) {
            this.addFormasiReportForm
              .get('provinsiName')
              .setValue(provinsi.name)
          }
        })
        break
      case 'kabKota':
        this.kabKotaList.forEach(kabKota => {
          if (kabKota.id == id) {
            this.addFormasiReportForm.get('kabKotaName').setValue(kabKota.name)
          }
        })
        break
    }
  }

  getExportTypeData () {
    this.exportTypeLoading$.next(true)
    let loading: any = [false, false, false]

    this.apiService.getData('/api/v1/unit_kerja').subscribe({
      next: (response: any) => {
        this.unitKerjaList = response.map(
          (unitKerja: { [key: string]: any }) => new UnitKerja(unitKerja)
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

    this.apiService.getData('/api/v1/provinsi').subscribe({
      next: (response: any) => {
        this.provinsiList = response.map(
          (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
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

    this.apiService.getData('/api/v1/kab_kota').subscribe({
      next: (response: any) => {
        this.kabKotaList = response.map(
          (kabKota: { [key: string]: any }) => new KabKota(kabKota)
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
  }

  //   getListProvinsi () {
  //     this.provinsiList$ = this.apiService
  //       .getData(`/api/v1/provinsi/search?limit=10000`)
  //       .pipe(
  //         map(response =>
  //           response.data.map(
  //             (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
  //           )
  //         )
  //       )

  //     this.provinsiList$.forEach(provinsi => {
  //       console.log('p', provinsi)
  //     })
  //   }

  //   onProvinsiSwitch (event: Event) {
  //     const provinsiId = (event.target as HTMLSelectElement).value

  //     if (provinsiId) {
  //       this.getKabKotaList(provinsiId)
  //     }
  //   }

  //   getKabKotaList (provinsiId: string) {
  //     this.kabKotaList$ = this.apiService
  //       .getData(
  //         `/api/v1/kab_kota/search?eq_provinsi|id=${provinsiId}&limit=10000`
  //       )
  //       .pipe(
  //         map(response =>
  //           response.data.map(
  //             (kabKota: { [key: string]: any }) => new KabKota(kabKota)
  //           )
  //         )
  //       )
  //   }

  //   onKabKotaSwitch (event: Event) {
  //     const kabkotaId = (event.target as HTMLSelectElement).value

  //     if (kabkotaId) {
  //       this.getUnitKerjaList(kabkotaId)
  //     }
  //   }

  //   getUnitKerjaList (kabkotaId: string) {
  //     this.unitKerjaList$ = this.apiService
  //       .getData(
  //         `/api/v1/unit_kerja/search?eq_instansi|kabupatenId=${kabkotaId}&limit=10000`
  //       )
  //       .pipe(
  //         map(response =>
  //           response.data.map(
  //             (unitKerja: { [key: string]: any }) => new UnitKerja(unitKerja)
  //           )
  //         )
  //       )
  //   }

  onSubmit () {
    if (this.addFormasiReportForm.valid) {
      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) return

          const reportGenerate = new ReportGenerate()
          reportGenerate.reportId = this.reportId
          reportGenerate.fileType = this.addFormasiReportForm.value.fileType

          if (this.addFormasiReportForm.value.exportType == '') {
            reportGenerate.parameter = {}
          }

          if (this.addFormasiReportForm.value.exportType == 'unitKerja') {
            reportGenerate.parameter = {
              unitKerjaId: this.addFormasiReportForm.value.unitKerjaId,
              unitKerjaName: this.addFormasiReportForm.value.unitKerjaName
            }
          }

          if (this.addFormasiReportForm.value.exportType == 'provinsi') {
            reportGenerate.parameter = {
              provinsiId: this.addFormasiReportForm.value.provinsiId,
              provinsiName: this.addFormasiReportForm.value.provinsiName
            }
          }

          if (this.addFormasiReportForm.value.exportType == 'kabKota') {
            reportGenerate.parameter = {
              kabKotaId: this.addFormasiReportForm.value.kabKotaId,
              kabKotaName: this.addFormasiReportForm.value.kabKotaName
            }
          }
          console.log(reportGenerate)
          this.apiService
            .postData('/api/v1/report_generate', reportGenerate)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert(
                  'Success',
                  'Generating Report...'
                )
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
