import { ConfirmationService } from './../../../../modules/base/services/confirmation.service'
import { FormValidationService } from './../../../../modules/base/services/form-validation.service'
import { Component } from '@angular/core'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { BehaviorSubject, map, Observable } from 'rxjs'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
    selector: 'app-bidang-jabatan-add',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, CommonModule],
    templateUrl: './bidang-jabatan-add.component.html',
    styleUrl: './bidang-jabatan-add.component.scss',
})
export class BidangJabatanAddComponent {
    jabatanList$: Observable<Jabatan[]>
    jabatanForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)

    constructor(
        private apiService: ApiService,
        private formValidationService: FormValidationService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit() {
        this.getJabatanList()
        this.handleFormInit()
    }

    handleFormInit() {
        this.jabatanForm = new FormGroup({
            name: new FormControl('', Validators.required),
            jabatanCode: new FormControl('', Validators.required),
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.jabatanForm.get(controlName),
            controlName,
            label,
        )
    }

    getJabatanList() {
        this.jabatanList$ = this.apiService
            .getData(`/api/v1/jabatan`)
            .pipe(
                map((response) =>
                    response.map(
                        (jabatan: { [key: string]: any }) =>
                            new Jabatan(jabatan),
                    ),
                ),
            )
    }

    onSubmit() {
        if (this.jabatanForm.invalid) {
            return
        }

        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.submitLoading$.next(true)

                const payload = {
                    name: this.jabatanForm.get('name')?.value,
                    jabatan_code: this.jabatanForm.get('jabatanCode')?.value,
                }

                this.apiService
                    .postData('/api/v1/bidang_jabatan', payload)
                    .subscribe({
                        next: () => {
                            this.submitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan data bidang jabatan',
                            )
                            this.jabatanForm.reset()
                        },
                        error: (error) => {
                            this.submitLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan data bidang jabatan',
                            )
                        },
                    })
            },
        })
    }
}
