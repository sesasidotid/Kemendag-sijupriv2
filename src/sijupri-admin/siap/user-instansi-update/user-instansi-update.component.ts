import { Component, Input } from '@angular/core'
import { UserInstansi } from '../../../modules/siap/models/user-instansi.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { InstansiType } from '../../../modules/maintenance/models/instansi-type.model'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { Output, EventEmitter } from '@angular/core'
@Component({
  selector: 'app-user-instansi-update',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-instansi-update.component.html',
  styleUrl: './user-instansi-update.component.scss'
})
export class UserInstansiUpdateComponent {
  @Output() refreshList = new EventEmitter<void>() // Create an event emitter

  @Input() userInstansi: UserInstansi
  instansiTypeList: InstansiType[]
  instansiList: Instansi[]
  provinsiList: Provinsi[]
  kabKotaList: KabKota[]

  instansiTypeCode: string = null

  instasiUser: Instansi = new Instansi()

  updateUserInstasi!: FormGroup
  userInstansiData: UserInstansi = new UserInstansi()

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.updateUserInstasi = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      instansi_id: new FormControl('', Validators.required),
      instansiTypeCode: new FormControl(''),
      provinsiId: new FormControl(''),
      kabupatenId: new FormControl(''),
      kotaId: new FormControl('')
    })
  }

  ngOnInit (): void {
    if (this.userInstansi.nip) {
      this.patchDefaultFormValue()
    }
    this.getInstansiTypeList()
  }

  getInstasiDetail () {
    this.apiService
      .getData(`/api/v1/instansi/${this.userInstansi.instansiId}`)
      .subscribe({
        next: (res: Instansi) => {
          this.instasiUser = res
          console.log('instansi', res)
          this.updateUserInstasi.patchValue({
            instansiTypeCode: res.instansiTypeCode,
            provinsiId: res.provinsiId,
            kabupatenId: res.kabupatenId,
            kotaId: res.kotaId
          })

          if (res.provinsiId) {
            this.getProvinsiList()
          }

          this.getInstansiList()

          console.log('z', this.updateUserInstasi.value)
        }
      })
  }

  patchDefaultFormValue () {
    this.apiService
      .getData(`/api/v1/user_instansi/${this.userInstansi.nip}`)
      .subscribe({
        next: (userInstansi: UserInstansi) => {
          this.userInstansiData = userInstansi
          console.log(this.updateUserInstasi)
          this.updateUserInstasi.patchValue({
            name: this.userInstansiData.name,
            email: this.userInstansiData.email,
            instansi_id: this.userInstansiData.instansiId
          })
          this.getInstasiDetail()
        },
        error: error => {
          this.handlerService.handleAlert('Error', error.error.message)
        }
      })
    console.log('patch', this.updateUserInstasi)
  }

  getInstansiTypeList () {
    this.apiService.getData(`/api/v1/instansi_type`).subscribe({
      next: response =>
        (this.instansiTypeList = response.map(
          (instansiType: { [key: string]: any }) =>
            new InstansiType(instansiType)
        )),
      error: error => this.handlerService.handleException(error)
    })
  }

  getInstansiList () {
    console.log('getInstansiList called', this.updateUserInstasi.value)
    switch (this.updateUserInstasi.get('instansiTypeCode').value) {
      case 'IT1':
      case 'IT2':
        this.apiService
          .getData(
            `/api/v1/instansi/type/${
              this.updateUserInstasi.get('instansiTypeCode').value
            }`
          )
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT3':
        this.apiService
          .getData(
            `/api/v1/instansi/provinsi/${
              this.updateUserInstasi.get('provinsiId').value
            }`
          )
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT4':
        this.apiService
          .getData(
            `/api/v1/instansi/kab_kota/${
              this.updateUserInstasi.get('kabupatenId').value
            }`
          )
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
      case 'IT5':
        this.apiService
          .getData(
            `/api/v1/instansi/kab_kota/${
              this.updateUserInstasi.get('kotaId').value
            }`
          )
          .subscribe({
            next: response =>
              (this.instansiList = response.map(
                (instansi: { [key: string]: any }) => new Instansi(instansi)
              )),
            error: error => this.handlerService.handleException(error)
          })
        break
    }
  }

  getProvinsiList () {
    this.apiService.getData(`/api/v1/provinsi`).subscribe({
      next: response => {
        this.provinsiList = response.map(
          (provinsi: { [key: string]: any }) => new Provinsi(provinsi)
        )

        if (
          ['IT4', 'IT5'].includes(
            this.updateUserInstasi.get('instansiTypeCode').value
          )
        ) {
          this.getKabKotaList()
        }
      },
      error: error => this.handlerService.handleException(error)
    })
  }

  getKabKotaList () {
    let type =
      this.updateUserInstasi.get('instansiTypeCode').value == 'IT4'
        ? 'KABUPATEN'
        : 'KOTA'

    if (this.updateUserInstasi.get('provinsiId').value) {
      this.apiService
        .getData(
          `/api/v1/kab_kota/type/${type}/${
            this.updateUserInstasi.get('provinsiId').value
          }`
        )
        .subscribe({
          next: response => {
            this.kabKotaList = response.map(
              (kabKota: { [key: string]: any }) => new KabKota(kabKota)
            )
          },
          error: error => this.handlerService.handleException(error)
        })
    }
  }

  onOperasionalChange () {
    this.updateUserInstasi.get('provinsiId').setValue(null)
    this.updateUserInstasi.get('kabupatenId').setValue(null)
    this.updateUserInstasi.get('kotaId').setValue(null)
    this.updateUserInstasi.get('instansi_id').setValue(null)

    console.log(
      'instansiTypeCode',
      this.updateUserInstasi.get('instansiTypeCode').value
    )
    if (
      ['IT3', 'IT4', 'IT5'].includes(
        this.updateUserInstasi.get('instansiTypeCode').value
      )
    ) {
      this.getProvinsiList()
    } else {
      this.getInstansiList()
    }
  }

  onProvinsiChange () {
    this.updateUserInstasi.get('kotaId').setValue(null)
    this.updateUserInstasi.get('kabupatenId').setValue(null)

    if (this.updateUserInstasi.get('provinsiId').value == null) {
      return
    }

    if (
      ['IT4', 'IT5'].includes(
        this.updateUserInstasi.get('instansiTypeCode').value
      )
    ) {
      this.getKabKotaList()
    } else {
      this.getInstansiList()
    }
  }

  onKabKotaChange () {
    this.updateUserInstasi.get('instansi_id').setValue(null)
    this.getInstansiList()
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) {
          return
        }

        if (this.updateUserInstasi.valid) {
          console.log('submit', this.updateUserInstasi.value)
          const updatedUserInstansi = {
            // ...this.userInstansi,
            // ...this.updateUserInstasi.value
            nip: this.userInstansi.nip,
            name: this.updateUserInstasi.get('name').value,
            email: this.updateUserInstasi.get('email').value,
            instansi_id: this.updateUserInstasi.get('instansi_id').value
          }

          this.apiService
            .putData(`/api/v1/user_instansi`, updatedUserInstansi)
            .subscribe({
              next: () => {
                this.handlerService.handleAlert(
                  'Success',
                  'Berhasil mengupdate user instansi'
                )
                this.refreshList.emit()

                // this.handlerService.handleNavigate('/siap/user-instansi')
                // setTimeout(() => {
                //   window.location.reload()
                // }, 100)
              },
              error: error => this.handlerService.handleException(error)
            })
        } else {
          this.handlerService.handleAlert('Error', 'Form tidak valid')
        }
      }
    })
  }
}
