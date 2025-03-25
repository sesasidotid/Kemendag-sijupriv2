import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
    FormControl,
    FormGroup,
    FormsModule,
    Validators,
    ReactiveFormsModule
} from '@angular/forms'
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../base/services/api.service';
@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
    @Output() goBack = new EventEmitter<void>();
    forgotPasswordForm!: FormGroup;
    isSubmitLoading$ = new BehaviorSubject<boolean>(false)
    submitMessage$ = new BehaviorSubject<{ status: string; message: string }>({
        status: '',
        message: ''
    })
    payload = {
        userId: ''
    }

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        this.isSubmitLoading$.next(false)
        this.handleFormInit()
    }

    handleFormInit() {
        this.forgotPasswordForm = new FormGroup({
            userId: new FormControl('', [
                Validators.required,
                Validators.pattern('^[0-9]+$'),
                Validators.minLength(18),
                Validators.maxLength(18)
            ]),
        })
    }

    navigateBack() {
        this.goBack.emit();
    }

    onSubmit() {
        if (this.forgotPasswordForm.invalid) return

        this.isSubmitLoading$.next(true)
        this.payload.userId = this.forgotPasswordForm.get('userId').value

        this.apiService.postData('/api/v1/forgot_password', this.payload).subscribe({
            next: res => {
                this.isSubmitLoading$.next(false)
                this.submitMessage$.next({
                    status: 'success',
                    message: 'Link reset password telah dikirim ke email Anda, pastikan email anda aktif dan sudah benar.'
                })
                this.forgotPasswordForm.reset()
            },
            error: err => {
                this.isSubmitLoading$.next(false)
                this.submitMessage$.next({
                    status: 'error',
                    message: 'Terjadi kesalahan, silahkan coba lagi.'
                })
            },
        })
    }
}
