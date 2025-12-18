import { Component, effect, inject, signal, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Auth } from '../../models/auth.model'
import { AuthService } from '../../services/auth.service'
import { AuthResponse } from '../../models/auth-response.model'
import { LoginContext } from '../../../base/commons/login-context'
import { Router, RouterModule } from '@angular/router'
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular'
import {
    RecaptchaComponent,
    RecaptchaFormsModule,
    RecaptchaModule,
} from 'ng-recaptcha'
import { environment } from '@/environments/environment'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { finalize } from 'rxjs'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-login-cat',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LucideAngularModule,
        RecaptchaModule,
        RecaptchaFormsModule,
        RouterModule,
        LoadingButtonComponent,
    ],
    templateUrl: './login-cat.component.html',
    styleUrl: './login-cat.component.scss',
})
export class LoginCatComponent {
    @ViewChild(RecaptchaComponent) recaptcha: RecaptchaComponent
    auth: Auth
    isPasswordVisible: boolean = false

    isLoginLoading = signal(false)
    loginMessage = signal({
        status: '',
        message: '',
    })
    recaptchaSiteKey = environment.recaptcha.siteKey
    selectedRole = signal<'participant' | 'examiner'>('participant')

    readonly Eye = Eye
    readonly EyeOff = EyeOff

    authService = inject(AuthService)
    router = inject(Router)
    formBuilder = inject(FormBuilder)
    formValidationService = inject(FormValidationService)

    loginForm = this.formBuilder.group({
        nip: [''],
        password: ['', [Validators.required]],
        recaptcha: [null as string | null, [Validators.required]],
    })

    private participantNipValidators = [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(18),
        Validators.maxLength(18),
    ]

    private examinerNipValidators = [Validators.required]

    constructor() {
        effect(() => {
            const role = this.selectedRole()
            const nipControl = this.loginForm.get('nip')

            if (!nipControl) return

            if (role === 'participant') {
                nipControl.setValidators(this.participantNipValidators)
            } else {
                nipControl.setValidators(this.examinerNipValidators)
            }

            nipControl.updateValueAndValidity({ emitEvent: false })
        })
    }

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

    selectRole(role: 'participant' | 'examiner'): void {
        this.selectedRole.set(role)
        this.loginMessage.set({ status: '', message: '' })
    }

    onSubmit() {
        this.isLoginLoading.set(true)
        this.auth = new Auth({
            username: this.loginForm.value.nip,
            password: this.loginForm.value.password,
        })

        const loginObservable =
            this.selectedRole() === 'examiner'
                ? this.authService.loginExaminer(this.auth)
                : this.authService.loginCAT(this.auth)

        loginObservable
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
