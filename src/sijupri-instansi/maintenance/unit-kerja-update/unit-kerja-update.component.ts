import { Component, Input, OnInit } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model'
import { CommonModule } from '@angular/common'
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
@Component({
  selector: 'app-unit-kerja-update',
  standalone: true,
  imports: [CommonModule, MapComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './unit-kerja-update.component.html',
  styleUrl: './unit-kerja-update.component.scss'
})
export class UnitKerjaUpdateComponent {
  @Input() id: string

  wilayahList: Wilayah[] = []
  unitKerja: UnitKerja = new UnitKerja()
  updateUnitKerjaForm!: FormGroup
  provinsi: Provinsi = new Provinsi()
  instansi: Instansi = new Instansi()

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.updateUnitKerjaForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      wilayah_code: new FormControl('', Validators.required),
      alamat: new FormControl('', Validators.required),
      latitude: new FormControl(''),
      longitude: new FormControl('')
    })
  }

  ngOnInit (): void {
    if (this.id) {
      this.fetchUnitKerjaData(this.id)
    }
  }

  fetchUnitKerjaData (id: string): void {
    this.apiService.getData(`/api/v1/unit_kerja/${id}`).subscribe({
      next: (unitKerja: UnitKerja) => {
        this.unitKerja = unitKerja
        console.log(this.updateUnitKerjaForm)
        this.updateUnitKerjaForm.patchValue({
          name: unitKerja.name,
          email: unitKerja.email,
          phone: unitKerja.phone,
          alamat: unitKerja.alamat,
          wilayah_code: unitKerja.wilayahCode,
          latitude: unitKerja.latitude,
          longitude: unitKerja.longitude,
          instansiid: unitKerja.instansiId
        })

        this.getUnitKerjaInstasi()
      },
      error: error => {
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  getUnitKerjaInstasi () {
    this.apiService
      .getData(`/api/v1/instansi/${this.unitKerja.instansiId}`)
      .subscribe({
        next: (instansi: Instansi) => {
          this.instansi = instansi
          this.getUnitKerjaProvinsiDetail()
        },
        error: error => {
          this.handlerService.handleAlert('Error', error.error.message)
        }
      })
  }

  getUnitKerjaProvinsiDetail () {
    this.apiService
      .getData(`/api/v1/provinsi/${this.instansi.provinsiId}`)
      .subscribe({
        next: (provinsi: Provinsi) => {
          this.provinsi = provinsi
          this.getWilayahList()
        },
        error: error => {
          this.handlerService.handleAlert('Error', error.error.message)
        }
      })
  }
  getWilayahList (): void {
    this.apiService.getData(`/api/v1/wilayah`).subscribe({
      next: (wilayahList: Wilayah[]) => {
        // this.wilayahList = wilayahList
        wilayahList.forEach(wilayah => {
          if (
            ['WL7', 'WL8', 'WL9'].includes(wilayah.code) ||
            wilayah.code == this.provinsi.wilayahCode
          ) {
            this.wilayahList.push(wilayah)
          }
        })
      },
      error: error => {
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  onCoordinatesReceived (coordinates: { lat: number; lng: number }): void {
    this.updateUnitKerjaForm.patchValue({
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString()
    })
  }

  submit (): void {
    if (this.updateUnitKerjaForm.valid) {
      const updatedProvinsi = {
        // ...this.provinsi,
        id: this.unitKerja.id.toString(),
        instansi_id: this.unitKerja.instansiId.toString(),
        ...this.updateUnitKerjaForm.value
      }

      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) {
            return
          }

          console.log(updatedProvinsi)

          this.apiService
            .putData(`/api/v1/unit_kerja`, updatedProvinsi)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert(
                  'Success',
                  'Unit Kerja berhasil diperbarui'
                )
                this.updateUnitKerjaForm.reset()
                window.location.reload()
              },
              error: error => {
                this.handlerService.handleAlert('Error', error.error.message)
              }
            })
        }
      })
    }
  }
}
