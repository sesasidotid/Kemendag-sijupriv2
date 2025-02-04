import { Component, Input, OnInit } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
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
@Component({
  selector: 'app-provinsi-update',
  standalone: true,
  imports: [MapComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './provinsi-update.component.html',
  styleUrl: './provinsi-update.component.scss'
})
export class ProvinsiUpdateComponent implements OnInit {
  @Input() id: string

  wilayahList: Wilayah[] = []
  provinsi: Provinsi = new Provinsi()

  updateProvinsiForm!: FormGroup

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.updateProvinsiForm = new FormGroup({
      name: new FormControl('', Validators.required),
      wilayah_code: new FormControl('', Validators.required),
      latitude: new FormControl(''),
      longitude: new FormControl('')
    })
  }

  ngOnInit (): void {
    if (this.id) {
      this.fetchProvinsiData(this.id)
    }
    this.getWilayahList()
  }

  fetchProvinsiData (id: string): void {
    this.apiService.getData(`/api/v1/provinsi/${id}`).subscribe({
      next: (provinsi: Provinsi) => {
        this.provinsi = provinsi
        console.log(this.updateProvinsiForm)
        this.updateProvinsiForm.patchValue({
          name: provinsi.name,
          wilayah_code: provinsi.wilayahCode,
          latitude: provinsi.latitude,
          longitude: provinsi.longitude
        })
      },
      error: error => {
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  parseStrToInt (str: string): number {
    console.log(parseFloat(str))
    return parseFloat(str)
  }

  getWilayahList (): void {
    this.apiService.getData(`/api/v1/wilayah`).subscribe({
      next: (wilayahList: Wilayah[]) => {
        this.wilayahList = wilayahList
      },
      error: error => {
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  onCoordinatesReceived (coordinates: { lat: number; lng: number }): void {
    this.updateProvinsiForm.patchValue({
      latitude: coordinates.lat.toString(),
      longitude: coordinates.lng.toString()
    })
  }

  submit (): void {
    if (this.updateProvinsiForm.valid) {
      const updatedProvinsi = {
        // ...this.provinsi,
        id: this.provinsi.id.toString(),
        ...this.updateProvinsiForm.value
      }

      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) {
            return
          }

          console.log(updatedProvinsi)

          this.apiService
            .putData(`/api/v1/provinsi`, updatedProvinsi)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert(
                  'Success',
                  'Provinsi berhasil diperbarui'
                )
                this.updateProvinsiForm.reset()
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
