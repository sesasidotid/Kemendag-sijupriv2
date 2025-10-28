import { Component } from '@angular/core'
import { JF } from '../../../modules/siap/models/jf.model'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { JfService } from '../../../modules/siap/services/jf.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { JenisKelamin } from '../../../modules/maintenance/models/jenis-kelamin.model'
import { TabService } from '../../../modules/base/services/tab.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ApiService } from '../../../modules/base/services/api.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { AlertService } from '../../../modules/base/services/alert.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { FormValidationService } from '../../../modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '../../../modules/base/components/loading-button/loading-button.component'
@Component({
    selector: 'app-jf-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './jf-add.component.html',
    styleUrl: './jf-add.component.scss',
})
export class JfAddComponent {
    jf = new JF()
    instansi: Instansi
    unitKerja: UnitKerja
    jenisKelaminList: JenisKelamin[]

    loadingInstansi$ = new BehaviorSubject<boolean>(true)
    loadingUnitKerja$ = new BehaviorSubject<boolean>(true)
    createJFLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )

    jfAddForm!: FormGroup

    constructor(
        private apiService: ApiService,
        private jfService: JfService,
        private tabService: TabService,
        private handlerService: HandlerService,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.handleFormInit()
        this.handleTabService()
        this.getJenisKelaminList()
        this.getInstansi()
        this.getUnitKerja()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.jfAddForm.get(controlName),
            controlName,
            label,
        )
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }
        this.tabService
            .addTab({
                label: 'Daftar User Jabatan Fungsional',
                icon: 'mdi-list-box',
                onClick: () =>
                    this.handlerService.handleNavigate(`/siap/user-jf`),
            })
            .addTab({
                label: 'Tambah User Jabatan Fungsional',
                icon: 'mdi-plus-circle',
                isActive: true,
                onClick: () =>
                    this.handlerService.handleNavigate(`/siap/user-jf/add`),
            })
    }

    handleFormInit() {
        this.jfAddForm = new FormGroup({
            name: new FormControl('', [Validators.required]),
            jenisKelaminCode: new FormControl('', [Validators.required]),
            nip: new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d{18}$/),
            ]),
            email: new FormControl('', [Validators.required, Validators.email]),
        })
    }

    getInstansi() {
        this.loadingInstansi$.next(true)
        this.apiService
            .getData(`/api/v1/instansi/${LoginContext.getInstansiId()}`)
            .subscribe({
                next: (instansi: Instansi) => {
                    this.instansi = instansi
                    this.loadingInstansi$.next(false)
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                    this.loadingInstansi$.next(false)
                },
            })
    }

    getUnitKerja() {
        this.loadingUnitKerja$.next(true)
        this.apiService
            .getData(`/api/v1/unit_kerja/${LoginContext.getUnitKerjaId()}`)
            .subscribe({
                next: (unitKerja: UnitKerja) => {
                    this.unitKerja = unitKerja
                    this.loadingUnitKerja$.next(false)
                },
                error: (error) => {
                    this.handlerService.handleException(error)
                    this.loadingUnitKerja$.next(false)
                },
            })
    }

    getJenisKelaminList() {
        this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
            next: (jenisKelaminList: JenisKelamin[]) =>
                (this.jenisKelaminList = jenisKelaminList),
            error: (error) => this.handlerService.handleException(error),
        })
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.createJFLoading$.next(true)
                this.jf = new JF(this.jfAddForm.value)
                this.jf.unitKerjaId = LoginContext.getUnitKerjaId()

                this.jfService
                    .save(this.jf)
                    .pipe(
                        finalize(() => {
                            this.createJFLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.alertService.showToast(
                                'Success',
                                'Berhasil menambah user JF.',
                            )
                            this.handlerService.handleNavigate(`/siap/user-jf`)
                        },
                    })
            },
        })
    }
}
