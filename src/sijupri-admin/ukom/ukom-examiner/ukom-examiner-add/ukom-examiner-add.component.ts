import { CommonModule } from '@angular/common'
import { Component, EventEmitter, inject, Output } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { Router } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ExaminerUkom } from '../../../../modules/ukom/models/examiner.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { FormValidationService } from '@/modules/base/services/form-validation.service'

@Component({
    selector: 'app-ukom-examiner-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-examiner-add.component.html',
    styleUrl: './ukom-examiner-add.component.scss',
})
export class UkomExaminerAddComponent {
    formValidationService = inject(FormValidationService)
    @Output() changeTabActive: EventEmitter<any> = new EventEmitter()

    examinerForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)

    examinerData: ExaminerUkom = new ExaminerUkom()

    constructor(
        private confirmationService: ConfirmationService,
        private router: Router,
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit() {
        this.handleFormInit()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.examinerForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.examinerForm = new FormGroup({
            name: new FormControl('', Validators.required),
            nip: new FormControl('', Validators.required),
            jenis_kelamin_code: new FormControl('', Validators.required),
            password: new FormControl('', [Validators.required]),
            confirmPassword: new FormControl('', [
                Validators.required,
                this.passwordMatchValidator.bind(this),
            ]),
        })
    }

    passwordMatchValidator(
        control: FormControl,
    ): { [key: string]: boolean } | null {
        if (this.examinerForm) {
            const password = this.examinerForm.get('password')?.value
            const confirmPassword = control.value
            if (password !== confirmPassword) {
                return { mismatch: true }
            }
        }
        return null
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading$.next(true)

                this.examinerData.name = this.examinerForm.get('name').value
                this.examinerData.nip = this.examinerForm.get('nip').value
                this.examinerData.jenis_kelamin_code =
                    this.examinerForm.get('jenis_kelamin_code').value
                this.examinerData.password =
                    this.examinerForm.get('password').value

                this.apiService
                    .postData('/api/v1/examiner_ukom', this.examinerData)
                    .pipe(finalize(() => this.submitLoading$.next(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil membuat penguji baru',
                            )
                            this.examinerForm.reset()
                            // this.changeTabActive.emit(0)
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal membuat penguji baru',
                            )
                        },
                    })
            },
        })
    }
}
