import { Component } from '@angular/core'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model'
import { CommonModule } from '@angular/common'
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { RouterLink } from '@angular/router'
import { UserUnitKerjaService } from '../../../modules/siap/services/user-unit-kerja.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { ProfileCardComponent } from '../../../modules/base/components/profile-card/profile-card.component'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ProfileCardComponent,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userUnitKerja: UserUnitKerja = new UserUnitKerja()
  nip: string = LoginContext.getUserId()
  name: string = LoginContext.getName()

  userUnitKerjaForm!: FormGroup

  constructor (
    private userUnitKerjaService: UserUnitKerjaService,
    private alertService: AlertService
  ) {
    this.getUserUnitKerja()

    this.userUnitKerjaForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      //   jenisKelaminCode: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ])
    })
  }

  getUserUnitKerja () {
    this.userUnitKerjaService.findByNip(this.nip).subscribe({
      next: (userUnitKerja: UserUnitKerja) => {
        this.userUnitKerja = userUnitKerja

        this.userUnitKerjaForm.patchValue({
          name: userUnitKerja.name,
          email: userUnitKerja.email,
          phone: userUnitKerja.phone
          //   jenisKelaminCode: userUnitKerja.jenisKelaminCode
        })
      },
      error: () =>
        this.alertService.showToast(
          'Error',
          'Gagal memperoleh data user unit kerja!'
        )
    })
  }

  submit () {
    if (this.userUnitKerjaForm.valid) {
      this.userUnitKerja.name = this.userUnitKerjaForm.value.name
      this.userUnitKerja.email = this.userUnitKerjaForm.value.email
      this.userUnitKerja.phone = this.userUnitKerjaForm.value.phone
      //   this.userUnitKerja.jenisKelaminCode =
      //     this.userUnitKerjaForm.value.jenisKelaminCode
      this.userUnitKerjaService.update(this.userUnitKerja).subscribe({
        next: () => {
          this.alertService.showToast(
            'Success',
            'Berhasil memperbarui data user unit kerja!'
          )
        },
        error: () =>
          this.alertService.showToast(
            'Error',
            'Gagal memperbarui data user unit kerja!'
          )
      })
    }
  }
}
