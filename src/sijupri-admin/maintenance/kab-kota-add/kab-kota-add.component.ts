import { Component, EventEmitter, Output } from '@angular/core'
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
  selector: 'app-kab-kota-add',
  standalone: true,
  imports: [
    PagableComponent,
    MapComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './kab-kota-add.component.html',
  styleUrl: './kab-kota-add.component.scss'
})
export class KabKotaAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
  tab$ = new BehaviorSubject<number | null>(0)
  submitLoading$ = new BehaviorSubject<boolean>(false)

  provinsiList: Provinsi[] = []
  kabkota: KabKota = new KabKota()
  addKabKotaForm!: FormGroup

  constructor (
    private router: Router,
    private tabService: TabService,
    private handlerService: HandlerService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService
  ) {
    this.addKabKotaForm = new FormGroup({
      name: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      provinsi_id: new FormControl('', Validators.required)
    })
  }

  ngOnInit () {
    this.getProvinsiList()
  }

  getProvinsiList () {
    this.apiService.getData(`/api/v1/provinsi`).subscribe({
      next: res => {
        this.provinsiList = res
        console.log(this.provinsiList)
      }
    })
  }

  onCoordinatesReceived (coordinates: { lat: number; lng: number }): void {
    this.kabkota.latitude = coordinates.lat.toString()
    this.kabkota.longitude = coordinates.lng.toString()
  }

  submit () {
    if (this.addKabKotaForm.valid) {
      this.kabkota.name = this.addKabKotaForm.value.name
      this.kabkota.type = this.addKabKotaForm.value.type
      this.kabkota.provinsi_id = this.addKabKotaForm.value.provinsi_id

      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) {
            return
          }

          this.apiService.postData(`/api/v1/kab_kota`, this.kabkota).subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Kabupaten Kota berhasil ditambahkan'
              )
              this.addKabKotaForm.reset()
              this.kabkota = new KabKota()
              window.location.reload()
            },
            error: error => {
              this.handlerService.handleAlert('Error', error.error.message)
              console.log(error)
            }
          })
        }
      })
    }
  }
}
