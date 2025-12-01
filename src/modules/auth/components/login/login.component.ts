import { Component, inject, signal, ViewChild } from '@angular/core'
import { ApplicationService } from '../../../security/services/application.service'
import { CommonModule } from '@angular/common'
import {
    FormsModule,
    Validators,
    ReactiveFormsModule,
    FormBuilder,
} from '@angular/forms'
import { Auth } from '../../models/auth.model'
import { AuthService } from '../../services/auth.service'
import { AuthResponse } from '../../models/auth-response.model'
import { LoginContext } from '../../../base/commons/login-context'
import { Router, RouterModule } from '@angular/router'
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular'
import { finalize } from 'rxjs'
import {
    RecaptchaModule,
    RecaptchaComponent,
    RecaptchaFormsModule,
} from 'ng-recaptcha'
import { environment } from '../../../../environments/environment'

import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LucideAngularModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        LoadingButtonComponent,
        RouterModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    @ViewChild(RecaptchaComponent) recaptcha: RecaptchaComponent

    auth = new Auth()
    isPasswordVisible: boolean = false

    isLoginLoading = signal(false)
    loginMessage = signal({
        status: '',
        message: '',
    })
    recaptchaSiteKey = environment.recaptcha.siteKey

    readonly Eye = Eye
    readonly EyeOff = EyeOff

    applicationServce = inject(ApplicationService)
    authService = inject(AuthService)
    router = inject(Router)
    formValidationService = inject(FormValidationService)
    formBuilder = inject(FormBuilder)

    loginForm = this.formBuilder.group({
        nip: [
            '',
            [
                Validators.required,
                Validators.pattern('^[0-9]+$'),
                Validators.minLength(18),
                Validators.maxLength(18),
            ],
        ],
        password: ['', [Validators.required]],
        recaptcha: [null as string | null, [Validators.required]],
    })

    constructor() {}

    ngOnInit() {
        if (LoginContext.isLogin()) {
            this.router.navigate(['/'])
        }
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.loginForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible
    }

    onSubmit() {
        this.isLoginLoading.set(true)
        this.auth = new Auth({
            username: this.loginForm.value.nip,
            password: this.loginForm.value.password,
        })

        this.authService
            .login(this.auth)
            .pipe(
                finalize(() => {
                    this.isLoginLoading.set(false)
                }),
            )
            .subscribe({
                next: (authResponse: AuthResponse) => {
                    LoginContext.storeContextLocalStorage(authResponse)
                    this.loginMessage.set({
                        status: 'success',
                        message: 'Login berhasil, tunggu sebentar...',
                    })
                    setTimeout(() => {
                        window.location.reload()
                    }, 1500)
                },
                error: (error) => {
                    console.error(error)
                    this.loginMessage.set({
                        status: 'error',
                        message: 'Login gagal, tolong coba lagi.',
                    })

                    this.loginForm.get('recaptcha')?.setValue(null)
                    this.loginForm.get('password')?.setValue('')
                },
            })
    }
}
