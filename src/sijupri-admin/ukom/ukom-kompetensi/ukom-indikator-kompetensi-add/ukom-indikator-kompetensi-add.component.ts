import { Component, Input, SimpleChanges } from '@angular/core'
import { ApiService } from '../../../../modules/base/services/api.service'
import { KompetensiUkom } from '../../../../modules/ukom/models/kompetensi'
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { IndikatorKompetensiUkom } from '../../../../modules/ukom/models/indikator-kompetensi'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
    selector: 'app-ukom-indikator-kompetensi-add',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './ukom-indikator-kompetensi-add.component.html',
    styleUrl: './ukom-indikator-kompetensi-add.component.scss'
})
export class UkomIndikatorKompetensiAddComponent {
    @Input() kompetensi: KompetensiUkom = new KompetensiUkom()

    isSubmitLoading$ = new BehaviorSubject<boolean>(false)

    indikatorKompetensiForm = this.fb.group({
        code: ['', [Validators.required]],
        name: ['', [Validators.required, Validators.minLength(3)]],
        kompetensi_id: ['', Validators.required]
    })

    constructor (
        private apiService: ApiService,
        private fb: FormBuilder,
        private formValidationService: FormValidationService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService
    ) {}

    ngOnInit (): void {}

    ngOnChanges (changes: SimpleChanges): void {
        if (changes['kompetensi'] && this.kompetensi?.id) {
            this.loadData()
        }
    }

    loadData (): void {
        this.indikatorKompetensiForm.patchValue({
            kompetensi_id: this.kompetensi.id
        })
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.indikatorKompetensiForm.get(controlName),
            controlName,
            label
        )
    }

    onSubmit (): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                const payload = new IndikatorKompetensiUkom(
                    this.indikatorKompetensiForm.value
                )

                this.isSubmitLoading$.next(true)

                this.apiService
                    .postData('/api/v1/kompetensi_indikator', payload)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan indikator kompetensi'
                            )

                            this.indikatorKompetensiForm.reset()
                            this.loadData()

                            this.isSubmitLoading$.next(false)
                        },
                        error: err => {
                            console.error(
                                'Error adding indikator kompetensi:',
                                err
                            )
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan indikator kompetensi'
                            )
                            this.isSubmitLoading$.next(false)
                        }
                    })
            }
        })
    }
}
