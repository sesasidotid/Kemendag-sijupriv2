import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
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
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-user-unit-kerja-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-unit-kerja-update.component.html',
  styleUrl: './user-unit-kerja-update.component.scss'
})
export class UserUnitKerjaUpdateComponent {
  @Input() userUnitKerja: UserUnitKerja

  unitKerjaList: UnitKerja[] = []
  instansiId: string = LoginContext.getInstansiId()

  unitKerjaUser = new UnitKerja()

  updateUserUnitKerja!: FormGroup
  userUnitKerjaData: UserUnitKerja = new UserUnitKerja()

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.updateUserUnitKerja = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      unit_kerja_id: new FormControl('', Validators.required)
    })
  }

  ngOnInit (): void {
    if (this.userUnitKerja.nip) {
      this.patchDefaultFormValue()
    }
    this.getUnitKerjaList()
  }

  patchDefaultFormValue () {
    this.apiService
      .getData(`/api/v1/user_unit_kerja/${this.userUnitKerja.nip}`)
      .subscribe({
        next: (userUnitKerja: UserUnitKerja) => {
          this.userUnitKerjaData = userUnitKerja
          console.log(this.userUnitKerjaData)

          this.updateUserUnitKerja.patchValue({
            name: this.userUnitKerjaData.name,
            email: this.userUnitKerjaData.email,
            unit_kerja_id: this.userUnitKerjaData.unitKerjaId
          })
        },
        error: error => {
          this.handlerService.handleAlert('Error', error.error.message)
        }
      })
  }

  getUnitKerjaList () {
    this.apiService
      .getData(`/api/v1/unit_kerja/instansi/${this.instansiId}`)
      .subscribe({
        next: (res: UnitKerja[]) => {
          this.unitKerjaList = res
        },
        error: error => {
          this.handlerService.handleAlert('Error', error.error.message)
        }
      })
  }

  checkObject (obj: any) {
    return !Object.values(obj).some(value => value === '')
  }

  submit () {
    console.log(this.updateUserUnitKerja.value)

    const payload = {
      nip: this.userUnitKerja.nip,
      name: this.updateUserUnitKerja.value.name,
      email: this.updateUserUnitKerja.value.email,
      unit_kerja_id: this.updateUserUnitKerja.value.unit_kerja_id
    }

    if (!this.checkObject(payload)) {
      this.handlerService.handleAlert('Error', 'Mohon isi semua field yang ada')
      return
    }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService.putData('/api/v1/user_unit_kerja', payload).subscribe({
          next: () => {
            this.handlerService.handleAlert(
              'Success',
              'User Unit Kerja berhasil diupdate'
            )
            this.handlerService.handleNavigate(`/siap/user-unit-kerja`)
            setTimeout(() => {
              window.location.reload()
            }, 1000) // Adjust the delay as needed
          },
          error: error => {
            console.log(error)
            this.handlerService.handleAlert(
              'Error',
              'Gagal mengupdate user unit kerja'
            )
          }
        })
      }
    })
  }
}
