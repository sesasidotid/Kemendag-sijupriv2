import { ConfirmationService } from './../../services/confirmation.service'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
    AbstractControl,
    ValidationErrors,
    FormControl
} from '@angular/forms'
import { UserService } from '../../../security/services/user.service'
import { CommonModule } from '@angular/common'
import { FormValidationService } from '../../../base/services/form-validation.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { HandlerService } from '../../services/handler.service'
import { ConfirmationDialogComponent } from '../../components/confirmation-dialog/confirmation-dialog.component'
@Component({
    selector: 'app-force-password-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ConfirmationDialogComponent
    ],
    templateUrl: './force-password-form.component.html',
    styleUrl: './force-password-form.component.scss'
})
export class ForcePasswordFormComponent {
    @Input() userId!: string
    @Input() showCancelButton: boolean = false
    @Output() passwordUpdated = new EventEmitter<void>()
    @Output() cancelled = new EventEmitter<void>()

    form: FormGroup
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor (
        private fb: FormBuilder,
        private userService: UserService,
        private formValidationService: FormValidationService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService
    ) {
        this.form = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: [
                '',
                [Validators.required, this.passwordMatchValidator.bind(this)]
            ]
        })
    }

    passwordMatchValidator (
        control: FormControl
    ): { [key: string]: boolean } | null {
        if (this.form) {
            const password = this.form.get('password')?.value
            const confirmPassword = control.value
            if (password !== confirmPassword) {
                return { mismatch: true }
            }
        }
        return null
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.form.get(controlName),
            controlName,
            label
        )
    }

    submitForm () {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.isLoading$.next(true)

                const password = this.form.value.password
                this.userService
                    .forceUpdatePassword(this.userId, password)
                    .pipe(
                        finalize(() => {
                            this.isLoading$.next(false)
                        })
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil memperbarui kata sandi.'
                            )
                            this.passwordUpdated.emit()
                            this.form.reset()
                        },
                        error: () => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal memperbarui kata sandi.'
                            )
                        }
                    })
            }
        })
    }

    cancel () {
        this.form.reset()
        this.cancelled.emit()
    }
}
