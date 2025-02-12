import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { TabService } from '../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { InstasiAddComponent } from '../instasi-add/instasi-add.component'
import { CommonModule } from '@angular/common'
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model'
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'

@Component({
  selector: 'app-kab-kota-update',
  standalone: true,
  imports: [MapComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './kab-kota-update.component.html',
  styleUrl: './kab-kota-update.component.scss'
})
export class KabKotaUpdateComponent {
  @Input() id: string
  @Output() refreshList = new EventEmitter<void>()

  KabKota: KabKota = new KabKota()
  provinsiList: Provinsi[] = []

  updateKabKotaForm!: FormGroup

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.updateKabKotaForm = new FormGroup({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      latitude: new FormControl(''),
      longitude: new FormControl(''),
      provinsi_id: new FormControl('', Validators.required)
    })
  }
  ngOnInit (): void {
    if (this.id) {
      this.fetchKabKotaData(this.id)
    }
    this.getProvinsiList()
  }

  fetchKabKotaData (id: string): void {
    this.apiService.getData(`/api/v1/kab_kota/${id}`).subscribe({
      next: (KabKota: KabKota) => {
        this.KabKota = KabKota
        console.log(this.updateKabKotaForm)
        this.updateKabKotaForm.patchValue({
          name: KabKota.name,
          type: KabKota.type,
          latitude: KabKota.latitude,
          longitude: KabKota.longitude,
          provinsi_id: KabKota.provinsiId.toString()
        })
      },
      error: error => {
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  getProvinsiList (): void {
    this.apiService.getData(`/api/v1/provinsi`).subscribe({
      next: (provinsiList: Provinsi[]) => {
        this.provinsiList = provinsiList
      },
      error: error => {
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  onCoordinatesReceived (coordinates: { lat: number; lng: number }): void {
    this.updateKabKotaForm.patchValue({
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString()
    })
  }

  submit (): void {
    if (this.updateKabKotaForm.valid) {
      const updateKabKota = {
        id: this.KabKota.id.toString(),
        ...this.updateKabKotaForm.value
      }

      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) {
            return
          }

          console.log(updateKabKota)

          this.apiService.putData(`/api/v1/kab_kota`, updateKabKota).subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Kabupaten Kota berhasil diperbarui'
              )
              this.updateKabKotaForm.reset()
              //   window.location.reload()
              this.refreshList.emit()
            },
            error: error => {
              console.log(error)
              this.handlerService.handleAlert(
                'Error',
                'Gagal memperbarui kabupaten kota'
              )
            }
          })
        }
      })
    }
  }
}
