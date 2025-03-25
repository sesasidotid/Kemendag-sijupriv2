import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import {
    FormControl,
    FormGroup,
    FormsModule,
    Validators,
    ReactiveFormsModule
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../base/services/api.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule,],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
    key: string;
    newPasswordForm!: FormGroup
    payload: any = {
        password: '',
    }
    submitMessage$ = new BehaviorSubject<{ status: string; message: string }>({
        status: '',
        message: ''
    })
    isSubmitLoading$ = new BehaviorSubject<boolean>(false)

    constructor(private activatedRoute: ActivatedRoute, private apiService: ApiService, private router: Router
    ) { }

    ngOnInit() {
        this.isSubmitLoading$.next(false)
        this.activatedRoute.queryParams.pipe(take(1)).subscribe(params => {
            if (!params['key']) {
                this.navigateTo('/login')
            }

            this.key = params['key'];
        });
        this.handleFormInit()
    }

    navigateTo(path: string) {
        this.router.navigate([path])
    }

    handleFormInit() {
        this.newPasswordForm = new FormGroup({
            password: new FormControl('', [Validators.required, Validators.minLength(8)
            ]),
            confirmPassword: new FormControl('', [Validators.required, this.passwordMatchValidator.bind(this)
            ])
        })
    }

    passwordMatchValidator(
        control: FormControl
    ): { [key: string]: boolean } | null {
        if (this.newPasswordForm) {
            const password = this.newPasswordForm.get('password')?.value
            const confirmPassword = control.value
            if (password !== confirmPassword) {
                return { mismatch: true }
            }
        }
        return null
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.newPasswordForm.get(controlName);

        if (!control || !control.errors || (!control.touched && !control.dirty)) {
            return null;
        }

        const errors = control.errors;

        if (errors['required']) {
            return `${label} tidak boleh kosong.`;
        }

        if (errors['email']) {
            return `Format ${label} tidak valid.`;
        }

        if (errors['minlength']) {
            return `${label} minimal ${errors['minlength'].requiredLength} karakter.`;
        }

        if (errors['pattern']) {
            if (controlName == 'nip') {
                return `${label} harus terdiri dari 18 digit angka.`;
            }

            if (controlName == 'nik') {
                return `${label} harus terdiri dari 16 digit angka.`;
            }

            if (controlName === 'phone') {
                return `${label} harus terdiri dari 10 hingga 15 digit angka.`;
            }

            return `Format ${label} tidak valid.`;
        }
        if (errors['mismatch']) {
            return `Password dan Konfirmasi Password tidak cocok.`;
        }

        return null;
    }

    onSubmit() {
        if (this.newPasswordForm.invalid) { return }

        this.isSubmitLoading$.next(true)

        this.payload.password = this.newPasswordForm.get('password')?.value

        this.apiService.putData(`/api/v1/password/forgot?key=${this.key}`, this.payload).subscribe({
            next: res => {
                this.isSubmitLoading$.next(false)
                this.submitMessage$.next({
                    status: 'success',
                    message: 'Password berhasil diubah'
                })
                setTimeout(() => {
                    this.navigateTo('/login')
                }, 2000)
            },
            error: err => {
                this.isSubmitLoading$.next(false)
                this.submitMessage$.next({
                    status: 'error',
                    message: 'Password gagal diubah'
                })
            }
        })
    }
}
