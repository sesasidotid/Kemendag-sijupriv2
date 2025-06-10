import { Component, ViewChild } from '@angular/core'
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
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha'
import { environment } from '../../../../environments/environment'
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component'
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LucideAngularModule,
        RecaptchaModule,
        ForgotPasswordComponent
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    @ViewChild(RecaptchaComponent) recaptcha: RecaptchaComponent

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
    isForgotPassword = false

    readonly Eye = Eye
    readonly EyeOff = EyeOff

    constructor (
        private applicationServce: ApplicationService,
        private authService: AuthService,
        private router: Router
    ) {
        setTimeout(() => {}, 0)
    }

    ngOnInit () {
        if (LoginContext.isLogin()) {
            this.router.navigate(['/'])
        }
        this.isLoginLoading$.next(false)
        this.getApplicationList()
        this.handleFormInit()
    }

    handleFormInit () {
        this.loginForm = new FormGroup({
            nip: new FormControl('', [
                Validators.required,
                Validators.pattern('^[0-9]+$'),
                Validators.minLength(18),
                Validators.maxLength(18)
            ]),
            password: new FormControl('', [Validators.required]),
            recaptcha: new FormControl(null, [Validators.required])
        })
    }

    getErrorMessage (controlName: string, label: string): string | null {
        const control = this.loginForm.get(controlName)

        if (
            !control ||
            !control.errors ||
            (!control.touched && !control.dirty)
        ) {
            return null // No error or untouched field
        }

        const errors = control.errors

        if (errors['required']) {
            return `${label} tidak boleh kosong.`
        }
        if (errors['email']) {
            return `Format ${label} tidak valid.`
        }
        if (errors['minlength']) {
            return `${label} minimal ${errors['minlength'].requiredLength} karakter.`
        }
        if (errors['pattern']) {
            if (controlName == 'nip') {
                return `${label} harus terdiri dari 18 digit angka.`
            }

            if (controlName == 'nik') {
                return `${label} harus terdiri dari 16 digit angka.`
            }

            if (controlName === 'phone') {
                return `${label} harus terdiri dari 10 hingga 15 digit angka.`
            }

            return `Format ${label} tidak valid.`
        }
        if (errors['mismatch']) {
            return `Password dan Konfirmasi Password tidak cocok.`
        }

        return null // Default case
    }

    showForgotPassword () {
        this.isForgotPassword = true
    }

    showLoginForm () {
        location.reload()
        // this.handleFormInit()
        // this.isForgotPassword = false;
    }

    navigateTo (path: string) {
        this.router.navigate([path])
    }

    getApplicationList () {
        this.applicationServce.findAll().subscribe({
            next: (applicationList: Application[]) => {
                this.applicationList = applicationList
            }
        })
    }

    onCaptchaResolved (token: string) {
        this.loginForm.get('recaptcha').setValue(token)
    }

    togglePasswordVisibility (): void {
        this.isPasswordVisible = !this.isPasswordVisible
    }

    backToLandingPage () {
        this.isLoginLoading$.next(false)
        this.router.navigate([''])
    }

    onSubmit () {
        if (this.loginForm.invalid) return

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

                    if (this.recaptcha) {
                        this.recaptcha.reset()
                    }

                    this.loginForm.get('recaptcha')?.setValue(null)
                }
            })
        }
    }
}
