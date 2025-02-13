import { Component } from '@angular/core'
import { ApplicationService } from '../../../security/services/application.service'
import { Application } from '../../../security/models/application.mode'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule
} from '@angular/forms'
import { Auth } from '../../models/auth.model'
import { AuthService } from '../../services/auth.service'
import { AuthResponse } from '../../models/auth-response.model'
import { LoginContext } from '../../../base/commons/login-context'
import { Router } from '@angular/router'
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular'
import { BehaviorSubject } from 'rxjs'
import { RecaptchaModule } from 'ng-recaptcha'
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    RecaptchaModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  auth: Auth = new Auth()
  authResponse: AuthResponse
  applicationList: Application[]
  loginForm!: FormGroup
  isPasswordVisible: boolean = false

  isLoginLoading$ = new BehaviorSubject<boolean>(false)
  loginMessage$ = new BehaviorSubject<{ status: string; message: string }>({
    status: '',
    message: ''
  })
  recaptchaSiteKey = environment.recaptcha.siteKey

  readonly Eye = Eye
  readonly EyeOff = EyeOff

  constructor (
    private applicationServce: ApplicationService,
    private authService: AuthService,
    private router: Router
  ) {
    if (LoginContext.isLogin()) {
      this.router.navigate(['/'])
    }
  }

  ngOnInit () {
    this.getApplicationList()
    this.loginForm = new FormGroup({
      nip: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(18)
      ]),
      password: new FormControl('', [Validators.required]),
      recaptcha: new FormControl(null, [Validators.required])
    })
  }

  getApplicationList () {
    this.applicationServce.findAll().subscribe({
      next: (applicationList: Application[]) => {
        this.applicationList = applicationList
        // this.auth.applicationCode = this.applicationList[0].code;
      }
    })
  }

  onCaptchaResolved (token: string) {
    this.loginForm.get('recaptcha').setValue(token)
  }

  togglePasswordVisibility (): void {
    this.isPasswordVisible = !this.isPasswordVisible // Toggle the visibility
  }

  onSubmit () {
    this.isLoginLoading$.next(true)
    if (this.loginForm.valid) {
      console.log(this.loginForm.value)
      this.auth.username = this.loginForm.value.nip
      this.auth.password = this.loginForm.value.password

      this.authService.login(this.auth).subscribe({
        next: (authResponse: AuthResponse) => {
          this.authResponse = authResponse
          LoginContext.storeContextLocalStorage(this.authResponse)
          this.loginMessage$.next({
            status: 'success',
            message: 'Login berhasil, tunggu sebentar...'
          })
        },
        complete: () => {
          this.isLoginLoading$.next(false)
          setTimeout(() => {
            this.router.navigate(['']).then(() => {
              window.location.reload()
            })
          }, 1500)
        },
        error: error => {
          this.isLoginLoading$.next(false)
          console.log('error', error)
          this.loginMessage$.next({
            status: 'error',
            message: 'Login gagal, tolong coba lagi.'
          })
        }
      })
    }
  }

  // submit() {
  //   console.log(this.auth);
  //   this.authService.login(this.auth).subscribe({
  //     next: (authResponse: AuthResponse) => {
  //       this.authResponse = authResponse;
  //       LoginContext.storeContextLocalStorage(this.authResponse);
  //       this.router.navigate(['']).then(() => {
  //         window.location.reload();
  //       });
  //     }
  //   });
  // }
}
