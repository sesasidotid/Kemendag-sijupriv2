import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { TabService } from '../../../modules/base/services/tab.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { AlertService } from '../../../modules/base/services/alert.service'

@Component({
  selector: 'app-user-unit-kerja-add',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './user-unit-kerja-add.component.html',
  styleUrl: './user-unit-kerja-add.component.scss'
})
export class UserUnitKerjaAddComponent {
  userUnitKerja: UserUnitKerja = new UserUnitKerja()
  unitKerjaList: UnitKerja[]

  unitKerjaForm!: FormGroup

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private tabService: TabService,
    private alertService: AlertService
  ) {
    this.unitKerjaForm = new FormGroup({
      unitKerja: new FormControl('', [Validators.required]),
      nip: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar User Unit Kerja',
        icon: 'mdi-list-box',
        onClick: () =>
          this.handlerService.handleNavigate(`/siap/user-unit-kerja`)
      })
      .addTab({
        label: 'Tambah User Unit Kerja',
        isActive: true,
        icon: 'mdi-plus-circle',
        onClick: () =>
          this.handlerService.handleNavigate(`/siap/user-unit-kerja/add`)
      })

    this.getUnitKerjaList()
  }

  getUnitKerjaList () {
    this.apiService
      .getData(`/api/v1/unit_kerja/instansi/${LoginContext.getInstansiId()}`)
      .subscribe({
        next: (unitKerjaList: UnitKerja[]) =>
          (this.unitKerjaList = unitKerjaList),
        error: error => this.handlerService.handleException(error)
      })
  }

  submit () {
    if (this.unitKerjaForm.valid) {
      this.userUnitKerja.unitKerjaId = this.unitKerjaForm.value.unitKerja
      this.userUnitKerja.nip = this.unitKerjaForm.value.nip
      this.userUnitKerja.name = this.unitKerjaForm.value.name
      this.userUnitKerja.email = this.unitKerjaForm.value.email
      this.userUnitKerja.password = this.unitKerjaForm.value.password

      console.log(this.userUnitKerja)
      this.apiService
        .postData(`/api/v1/user_unit_kerja`, this.userUnitKerja)
        .subscribe({
          next: () => {
            this.alertService.showToast(
              'Success',
              'User Unit Kerja berhasil ditambahkan'
            )
            this.handlerService.handleNavigate(`/siap/user-unit-kerja`)
          },
          error: error => this.handlerService.handleException(error)
        })
    }
  }
}
