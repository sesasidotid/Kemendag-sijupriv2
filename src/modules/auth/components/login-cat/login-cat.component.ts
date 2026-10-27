import {
    Component,
    effect,
    inject,
    OnDestroy,
    signal,
    ViewChild,
} from '@angular/core'
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
import {
    ArrowRight,
    BadgeCheck,
    ClipboardCheck,
    Eye,
    EyeOff,
    FileText,
    FolderOpen,
    Info,
    LockKeyhole,
    LucideAngularModule,
    MessagesSquare,
    UserRound,
} from 'lucide-angular'
import {
    RecaptchaComponent,
    RecaptchaFormsModule,
    RecaptchaModule,
} from 'ng-recaptcha'
import { environment } from '@/environments/environment'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { finalize } from 'rxjs'
import { createLoginClock } from '../login/login-clock'

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
    ],
    templateUrl: './login-cat.component.html',
    // Tampilan sama dengan halaman login SIJUPRI; berkas kedua hanya berisi pilihan peran
    styleUrls: ['../login/login.component.scss', './login-cat.component.scss'],
})
export class LoginCatComponent implements OnDestroy {
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
    readonly UserRound = UserRound
    readonly BadgeCheck = BadgeCheck
    readonly LockKeyhole = LockKeyhole
    readonly ArrowRight = ArrowRight
    readonly Info = Info
    readonly ClipboardCheck = ClipboardCheck
    readonly FileText = FileText
    readonly FolderOpen = FolderOpen
    readonly MessagesSquare = MessagesSquare

    clock = createLoginClock()

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

    ngOnDestroy() {
        this.clock.stop()
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
