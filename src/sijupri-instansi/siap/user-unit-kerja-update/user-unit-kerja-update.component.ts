import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UserInstansi } from '../../../modules/siap/models/user-instansi.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import {
    Form,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { UserUnitKerja } from '../../../modules/siap/models/user-unit-kerja.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { FormValidationService } from '../../../modules/base/services/form-validation.service'
import { BehaviorSubject } from 'rxjs'
import { LoadingButtonComponent } from '../../../modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-user-unit-kerja-update',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './user-unit-kerja-update.component.html',
    styleUrl: './user-unit-kerja-update.component.scss',
})
export class UserUnitKerjaUpdateComponent {
    @Input() userUnitKerja: UserUnitKerja
    @Output() refresh = new EventEmitter<void>()

    unitKerjaList: UnitKerja[] = []
    instansiId: string = ''
    submitLoading$ = new BehaviorSubject<boolean>(false)

    unitKerjaUser = new UnitKerja()

    updateUserUnitKerja!: FormGroup
    userUnitKerjaData: UserUnitKerja = new UserUnitKerja()

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit(): void {
        this.instansiId = LoginContext.getInstansiId()
        this.handleFormInit()
        if (this.userUnitKerja.nip) {
            this.patchDefaultFormValue()
        }
        this.getUnitKerjaList()
    }

    handleFormInit() {
        this.updateUserUnitKerja = new FormGroup({
            name: new FormControl('', Validators.required),
            email: new FormControl('', [Validators.required, Validators.email]),
            unit_kerja_id: new FormControl('', Validators.required),
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.updateUserUnitKerja.get(controlName),
            controlName,
            label,
        )
    }

    patchDefaultFormValue() {
        this.apiService
            .getData(`/api/v1/user_unit_kerja/${this.userUnitKerja.nip}`)
            .subscribe({
                next: (userUnitKerja: UserUnitKerja) => {
                    this.userUnitKerjaData = userUnitKerja
                    console.log(this.userUnitKerjaData)

                    this.updateUserUnitKerja.patchValue({
                        name: this.userUnitKerjaData.name,
                        email: this.userUnitKerjaData.email,
                        unit_kerja_id: this.userUnitKerjaData.unitKerjaId,
                    })
                },
                error: (error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        error.error.message,
                    )
                },
            })
    }

    getUnitKerjaList() {
        this.apiService
            .getData(`/api/v1/unit_kerja/instansi/${this.instansiId}`)
            .subscribe({
                next: (res: UnitKerja[]) => {
                    this.unitKerjaList = res
                },
                error: (error) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil data unit kerja',
                    )
                },
            })
    }

    checkObject(obj: any) {
        return !Object.values(obj).some((value) => value === '')
    }

    submit() {
        console.log(this.updateUserUnitKerja.value)

        const payload = {
            nip: this.userUnitKerja.nip,
            name: this.updateUserUnitKerja.value.name,
            email: this.updateUserUnitKerja.value.email,
            unit_kerja_id: this.updateUserUnitKerja.value.unit_kerja_id,
        }

        if (!this.checkObject(payload)) {
            this.handlerService.handleAlert(
                'Error',
                'Mohon isi semua field yang ada',
            )
            return
        }

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading$.next(true)

                this.apiService
                    .putData('/api/v1/user_unit_kerja', payload)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'User Unit Kerja berhasil diupdate',
                            )
                            this.refresh.emit()
                            this.submitLoading$.next(false)
                        },
                        error: (error) => {
                            console.log(error)
                            this.submitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengupdate user unit kerja',
                            )
                        },
                    })
            },
        })
    }
}
