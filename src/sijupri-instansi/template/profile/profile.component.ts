import { AlertService } from './../../../modules/base/services/alert.service'
import { UserInstansiService } from './../../../modules/siap/services/user-instansi.service'
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

import { ProfileCardComponent } from '../../../modules/base/components/profile-card/profile-card.component'
import { UserInstansi } from '../../../modules/siap/models/user-instansi.model'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ProfileCardComponent,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userInstasi: UserInstansi = new UserInstansi()
  nip: string = LoginContext.getUserId()
  name: string = LoginContext.getName()

  userInstasiForm!: FormGroup

  constructor (
    private UserInstansiService: UserInstansiService,
    private alertService: AlertService
  ) {
    this.getUserInstansi()

    this.userInstasiForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ])
    })
  }

  getUserInstansi () {
    this.UserInstansiService.findByNip(this.nip).subscribe({
      next: (userInstasi: UserInstansi) => {
        this.userInstasi = userInstasi

        this.userInstasiForm.patchValue({
          name: userInstasi.name,
          email: userInstasi.email,
          phone: userInstasi.phone
        })
      },
      error: () =>
        this.alertService.showToast(
          'Error',
          'Gagal memperoleh data user instasi!'
        )
    })
  }

  submit () {
    if (this.userInstasiForm.valid) {
      this.userInstasi.name = this.userInstasiForm.value.name
      this.userInstasi.email = this.userInstasiForm.value.email
      this.userInstasi.phone = this.userInstasiForm.value.phone

      this.UserInstansiService.update(this.userInstasi).subscribe({
        next: () => {
          this.alertService.showToast(
            'Success',
            'Berhasil memperbarui data user instasi!'
          )
        },
        error: () =>
          this.alertService.showToast(
            'Error',
            'Gagal memperbarui data user instasi!'
          )
      })
    }
  }
}
