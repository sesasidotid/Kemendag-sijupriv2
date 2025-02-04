import { Component } from '@angular/core'
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { CommonModule } from '@angular/common'
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model'
import { TabService } from '../../../modules/base/services/tab.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { BehaviorSubject, Observable } from 'rxjs'
import { AlertService } from '../../../modules/base/services/alert.service'

@Component({
  selector: 'app-unit-kerja-add',
  standalone: true,
  imports: [MapComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './unit-kerja-add.component.html',
  styleUrl: './unit-kerja-add.component.scss'
})
export class UnitKerjaAddComponent {
  instansiId: string = LoginContext.getInstansiId()
  unitKerja: UnitKerja = new UnitKerja()
  wilayahList: Wilayah[] = []
  instansi: Instansi
  provinsi: Provinsi
  kabKota: KabKota

  loadingInstansi$ = new BehaviorSubject<boolean>(true)
  loadingProvinsi$ = new BehaviorSubject<boolean>(false)
  loadingKabKota$ = new BehaviorSubject<boolean>(false)

  provinceName$ = new BehaviorSubject<string>('')
  kabKotaName$ = new BehaviorSubject<string>('')

  unitKerjaForm!: FormGroup

  constructor (
    private apiService: ApiService,
    private tabService: TabService,
    private handlerService: HandlerService,
    private alertService: AlertService
  ) {
    this.unitKerjaForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      alamat: new FormControl('', Validators.required),
      wilayahCode: new FormControl('', Validators.required)
    })
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar Unit Kerja',
        icon: 'mdi-list-box',
        onClick: () =>
          this.handlerService.handleNavigate(`/maintenance/unit-kerja`)
      })
      .addTab({
        label: 'Tambah Unit Kerja',
        isActive: true,
        icon: 'mdi-plus-circle',
        onClick: () =>
          this.handlerService.handleNavigate(`/maintenance/unit-kerja/add`)
      })

    this.getInstansi()
  }

  onCoordinatesReceived (coordinates: { lat: number; lng: number }): void {
    this.unitKerja.latitude = coordinates.lat
    this.unitKerja.longitude = coordinates.lng
  }

  getWilayahList () {
    this.apiService.getData(`/api/v1/wilayah`).subscribe({
      next: (wilayahList: Wilayah[]) => {
        wilayahList.forEach(wilayah => {
          if (
            ['WL7', 'WL8', 'WL9'].includes(wilayah.code) ||
            wilayah.code == this.provinsi.wilayahCode
          ) {
            this.wilayahList.push(wilayah)
          }
        })
      }
    })
  }

  getInstansi () {
    this.loadingInstansi$.next(true)
    this.apiService.getData(`/api/v1/instansi/${this.instansiId}`).subscribe({
      next: (instansi: Instansi) => {
        this.instansi = instansi
        this.unitKerja.instansiId = this.instansi.id
        if (this.instansi.provinsiId) {
          if (this.instansi.provinsiId) {
            this.getProvinsi()
          }
          if (this.instansi.kabupatenId || this.instansi.kotaId) {
            this.getKabKota()
          }
        } else {
          this.loadingProvinsi$.next(false)
          this.loadingKabKota$.next(false)
        }
        this.loadingInstansi$.next(false)
      }
    })
  }

  getProvinsi () {
    this.loadingProvinsi$.next(true)
    this.apiService
      .getData(`/api/v1/provinsi/${this.instansi.provinsiId}`)
      .subscribe({
        next: (provinsi: Provinsi) => {
          this.provinsi = provinsi
          this.unitKerja.wilayahCode = this.provinsi.wilayahCode
          this.getWilayahList()
          this.provinceName$.next(provinsi.name)
          this.provinceName$.subscribe(name => {
            console.log(name)
          })
          this.loadingProvinsi$.next(false)
        }
      })
  }

  getKabKota () {
    this.loadingKabKota$.next(true)
    let kabKotaId = this.instansi.kabupatenId ?? this.instansi.kotaId
    this.apiService.getData(`/api/v1/kab_kota/${kabKotaId}`).subscribe({
      next: (kabKota: KabKota) => {
        this.kabKota = kabKota
        this.kabKotaName$.next(kabKota.type + kabKota.name)
        this.loadingKabKota$.next(false)
      }
    })
  }

  submit () {
    if (this.unitKerjaForm.valid) {
      this.unitKerja.name = this.unitKerjaForm.value.name
      this.unitKerja.email = this.unitKerjaForm.value.email
      this.unitKerja.phone = this.unitKerjaForm.value.phone
      this.unitKerja.alamat = this.unitKerjaForm.value.alamat
      this.unitKerja.wilayahCode = this.unitKerjaForm.value.wilayahCode

      this.apiService.postData(`/api/v1/unit_kerja`, this.unitKerja).subscribe({
        next: () => {
          this.alertService.showToast(
            'Success',
            'Unit Kerja berhasil ditambahkan'
          )
          this.handlerService.handleNavigate('/maintenance/unit-kerja')
        },
        error: error => {
          this.alertService.showToast('Error', error.error.message)
          console.log(error)
        }
      })
    }
  }
}
