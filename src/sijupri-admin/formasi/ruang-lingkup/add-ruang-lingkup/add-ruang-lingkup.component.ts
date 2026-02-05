import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-add-ruang-lingkup',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './add-ruang-lingkup.component.html',
    styleUrl: './add-ruang-lingkup.component.scss',
})
export class AddRuangLingkupComponent implements OnInit {
    fb = inject(FormBuilder)
    confirmationService = inject(ConfirmationService)
    formValidationService = inject(FormValidationService)
    jabatanService = inject(JabatanService)

    ruangLingkupForm: FormGroup

    submitFormLoading = signal(false)
    ngOnInit() {
        this.jabatanService.fetchJabatan()
        this.initForm()
    }

    initForm() {
        this.ruangLingkupForm = this.fb.group({
            name: ['', [Validators.required]],
            jabatanCode: [null, [Validators.required]],
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.ruangLingkupForm.get(controlName),
            controlName,
            label,
        )
    }

    isFieldInvalid(name: string): boolean {
        const control = this.ruangLingkupForm.get(name)
        return !!(control && control.invalid && control.touched)
    }

    submitForm() {
        if (this.ruangLingkupForm.invalid) return

        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitFormLoading.set(true)

                //TODO: Change to real api
                setTimeout(() => {
                    this.submitFormLoading.set(false)
                    alert('Ruang Lingkup Berhasil Ditambahkan')
                    this.ruangLingkupForm.reset()
                }, 1500)
            },
        })
    }
}
