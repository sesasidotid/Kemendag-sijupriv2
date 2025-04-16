import { Component } from '@angular/core'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { User } from '../../../modules/security/models/user.model'
import { RoleService } from '../../../modules/security/services/role.service'
import { Role } from '../../../modules/security/models/role.model'
import { CommonModule } from '@angular/common'
import { AlertService } from '../../../modules/base/services/alert.service'
import { TabService } from '../../../modules/base/services/tab.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LucideAngularModule, Trash2, Eye, EyeOff } from 'lucide-angular'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { FormValidationService } from '../../../modules/base/services/form-validation.service'
import { BehaviorSubject } from 'rxjs'
import { LoadingButtonComponent } from '../../../modules/base/components/loading-button/loading-button.component'
@Component({
    selector: 'app-user-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LucideAngularModule,
        LoadingButtonComponent
    ],
    templateUrl: './user-add.component.html',
    styleUrl: './user-add.component.scss'
})
export class UserAddComponent {
    user: User = new User()
    roleList: Role[]
    roleCode: string = ''
    roleCodes: string[] = []

    addUserForm!: FormGroup
    isPasswordVisible: boolean = false
    isLoading$ = new BehaviorSubject<boolean>(false)

    readonly Trash2 = Trash2
    readonly Eye = Eye
    readonly EyeOff = EyeOff

    constructor(
        private alertService: AlertService,
        private apiService: ApiService,
        private roleService: RoleService,
        private tabService: TabService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService
    ) { }

    ngOnInit(): void {
        this.roleService.findByapplicationCode('sijupri-admin').subscribe({
            next: (roleList: Role[]) => (this.roleList = roleList)
        })
        this.handleTabService()
        this.handleFormInit()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(this.addUserForm.get(controlName), controlName, label);
    }

    handleFormInit() {
        this.addUserForm = new FormGroup({
            nip: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{18}$/)
            ]),
            name: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required]),
            confirmPassword: new FormControl('', [
                Validators.required,
                this.passwordMatchValidator.bind(this)
            ]),
        })
    }

    handleTabService() {
        this.tabService
            .addTab({
                label: 'Daftar User',
                icon: 'mdi-list-box',
                onClick: () => this.handlerService.handleNavigate('/security/user')
            })
            .addTab({
                label: 'Tambah User',
                isActive: true,
                icon: 'mdi-plus-circle',
                onClick: () => this.handlerService.handleNavigate('/security/user/add')
            })
    }

    passwordMatchValidator(
        control: FormControl
    ): { [key: string]: boolean } | null {
        if (this.addUserForm) {
            const password = this.addUserForm.get('password')?.value
            const confirmPassword = control.value
            if (password !== confirmPassword) {
                return { mismatch: true }
            }
        }
        return null
    }

    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible // Toggle the visibility
    }

    addRoleCode(event: Event) {
        const roleCode = (event.target as HTMLSelectElement).value
        if (roleCode && roleCode != '' && !this.roleCodes.includes(roleCode))
            this.roleCodes.push(roleCode)
                ; (event.target as HTMLSelectElement).value = ''
    }

    removeRoleCode(roleCode: string) {
        const index = this.roleCodes.indexOf(roleCode)
        if (index > -1) this.roleCodes.splice(index, 1)
    }

    onSubmit() {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.isLoading$.next(true)

                if (this.addUserForm.valid) {
                    this.user.roleCodeList = this.roleCodes
                    this.user.applicationCode = 'sijupri-admin'
                    this.user.channelCodeList = ['WEB']
                    this.user.id = this.addUserForm.value.nip
                    this.user.name = this.addUserForm.value.name
                    this.user.email = this.addUserForm.value.email
                    this.user.password = this.addUserForm.value.password

                    this.apiService.postData(`/api/v1/user`, this.user).subscribe({
                        next: () => {
                            this.isLoading$.next(false)
                            this.alertService.showToast('Success', 'Berhasil')
                            this.handlerService.handleNavigate('/security/user')
                        },
                        error: error => {
                            this.isLoading$.next(false)
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal membuat user admin'
                            )
                        }
                    })
                }
            }
        })
    }
}
