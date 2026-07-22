import { FormValidationService } from './../../../../modules/base/services/form-validation.service'
import { Component, OnInit } from '@angular/core'
import { JF } from '../../../../modules/siap/models/jf.model'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ApiService } from '../../../../modules/base/services/api.service'
import { JenisKelamin } from '../../../../modules/maintenance/models/jenis-kelamin.model'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { fileValidator } from '../../../../modules/base/validators/file-format.validator'
import { UkomTaskDetail } from '@/modules/ukom/models/ukom-task-detail.modal'
import { UkomTaskService } from '@/modules/ukom/services/ukom-task.service'

@Component({
    selector: 'app-jf-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './jf-detail.component.html',
    styleUrl: './jf-detail.component.scss',
})
export class JfDetailComponent implements OnInit {
    nip = LoginContext.getUserId()

    jf = new JF()
    ukomPendingTask = new UkomTaskDetail()
    jenisKelaminList: JenisKelamin[] = []
    isEditOpen: boolean = false
    loading$ = new BehaviorSubject<boolean>(true)
    submitLoading$ = new BehaviorSubject<boolean>(false)
    jfDetailForm!: FormGroup
    inputs: FIleHandler

    constructor(
        private apiService: ApiService,
        private alertService: AlertService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private formValidationService: FormValidationService,
        public ukomTaskService: UkomTaskService,
    ) {}

    ngOnInit() {
        this.getJf()
        this.getUkomPendingTask()
        this.handleFormInit()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.jfDetailForm.get(controlName),
            controlName,
            label,
        )
    }

    getUkomPendingTask(): void {
        this.ukomTaskService.findByNip(this.nip).subscribe({
            next: (response) => {
                this.ukomPendingTask = response
            },
            error: (err) => {
                if (err.status === 404) {
                    this.ukomPendingTask = null
                    return
                }

                console.error('Gagal mengambil pending task', err)
            },
        })
    }

    handleFormInit() {
        this.jfDetailForm = new FormGroup({
            name: new FormControl(this.jf.name, [Validators.required]),
            phone: new FormControl(this.jf.phone, [
                Validators.required,
                Validators.pattern(/^\d{10,15}$/),
            ]),
            email: new FormControl(this.jf.email, [
                Validators.required,
                Validators.email,
            ]),
            tempatLahir: new FormControl(this.jf.tempatLahir, [
                Validators.required,
            ]),
            tanggalLahir: new FormControl(this.jf.tanggalLahir, [
                Validators.required,
            ]),
            jenisKelaminCode: new FormControl(this.jf.jenisKelaminCode, [
                Validators.required,
            ]),
            nik: new FormControl(this.jf.nik, [
                Validators.required,
                Validators.pattern(/^\d{16}$/),
            ]),
            fileKtp: new FormControl('', [
                Validators.required,
                fileValidator(['application/pdf'], 2),
            ]),
        })
    }

    getJf() {
        this.loading$.next(true)
        this.apiService.getData(`/api/v1/jf/${this.nip}`).subscribe({
            next: (response) => {
                this.jf = response
                this.fileLoadHandler()
                this.inputs.files['ktp'].source = this.jf.ktpUrl

                this.jfDetailForm.patchValue({
                    name: this.jf.name,
                    phone: this.jf.phone,
                    email: this.jf.email,
                    tempatLahir: this.jf.tempatLahir,
                    tanggalLahir: this.jf.tanggalLahir,
                    jenisKelaminCode: this.jf.jenisKelaminCode,
                    nik: this.jf.nik,
                })

                this.loading$.next(false)
            },
            error: (error) => {
                this.loading$.next(false)
                console.error('Error fetching data', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data profil!',
                )
            },
        })
    }

    fileLoadHandler() {
        this.inputs = {
            files: {
                ktp: {
                    label: 'Dokumen KTP',
                    fileName: this.jf.ktp,
                    source: this.jf.ktpUrl,
                    required: true,
                },
            },
            maxSize: 2 * 1024 * 1024,
            allowedTypes: [{ type: 'application/pdf' }],
            viewOnly: true,
            listen: (key: string, source: string, base64Data: string) => {
                this.jfDetailForm.patchValue({ fileKtp: base64Data })
            },
        }
    }

    getJenisKelamin() {
        this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
            next: (response) => {
                this.jenisKelaminList = response.map(
                    (jenisKelamin: { [key: string]: any }) =>
                        new JenisKelamin(jenisKelamin),
                )
            },
            error: (error) => {
                console.error('Error fetching data', error)
                this.alertService.showToast(
                    'Error',
                    'Gagal mendapatkan data jenis kelamin!',
                )
            },
        })
    }

    toggleEdit() {
        this.isEditOpen = !this.isEditOpen
        this.inputs.viewOnly = !this.isEditOpen
        if (this.isEditOpen) {
            this.getJenisKelamin()
        }
    }

    submit() {
        if (this.jfDetailForm.valid) {
            this.jf.name = this.jfDetailForm.value.name
            this.jf.phone = this.jfDetailForm.value.phone
            this.jf.email = this.jfDetailForm.value.email
            this.jf.tempatLahir = this.jfDetailForm.value.tempatLahir
            this.jf.tanggalLahir = this.jfDetailForm.value.tanggalLahir
            this.jf.jenisKelaminCode = this.jfDetailForm.value.jenisKelaminCode
            this.jf.nik = this.jfDetailForm.value.nik
            this.jf.fileKtp = this.jfDetailForm.value.fileKtp

            this.confirmationService.open(false).subscribe({
                next: (result) => {
                    if (!result.confirmed) return
                    this.submitLoading$.next(true)
                    this.jf.nip = this.nip

                    this.apiService
                        .putData(`/api/v1/jf/task`, this.jf)
                        .subscribe({
                            next: () => {
                                this.alertService.showToast(
                                    'Success',
                                    'Berhasil mengajukan perubahan data.',
                                )
                                this.submitLoading$.next(false)
                                this.router.navigate(['/profile/pending'])
                            },
                            error: (error) => {
                                if (error.error.message == 'WFL00002') {
                                    this.alertService.showToast(
                                        'Error',
                                        'Sudah ada perubahan data yang sedang menunggu persetujuan.',
                                    )
                                }
                                this.submitLoading$.next(false)
                            },
                        })
                },
            })
        }
    }
}
