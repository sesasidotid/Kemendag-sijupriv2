import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import {
    FormsModule,
    Validators,
    ReactiveFormsModule,
    FormBuilder,
} from '@angular/forms'
import { finalize } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { RouterModule } from '@angular/router'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, LoadingButtonComponent],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
    formBuilder = inject(FormBuilder)
    apiService = inject(ApiService)
    formValidation = inject(FormValidationService)

    forgotPasswordForm = this.formBuilder.group({
        userId: [
            '',
            [
                Validators.required,
                Validators.pattern('^[0-9]+$'),
                Validators.minLength(18),
                Validators.maxLength(18),
            ],
        ],
    })

    isSubmitLoading = false
    submitMessage = { status: '', message: '' }

    constructor() {}

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.forgotPasswordForm.get(controlName)
        return this.formValidation.getErrorMessage(control, controlName, label)
    }

    onSubmit() {
        this.isSubmitLoading = true
        const userId = this.forgotPasswordForm.get('userId').value

        this.apiService
            .postData('/api/v1/forgot_password', { user_id: userId })
            .pipe(finalize(() => (this.isSubmitLoading = false)))
            .subscribe({
                next: () => {
                    this.submitMessage = {
                        status: 'success',
                        message:
                            'Link reset password telah dikirim ke email Anda, pastikan email anda aktif dan sudah benar.',
                    }
                    this.forgotPasswordForm.reset()
                },
                error: (err) => {
                    console.error(err)
                    this.submitMessage = {
                        status: 'error',
                        message: 'Terjadi kesalahan, silahkan coba lagi.',
                    }
                },
            })
    }
}
