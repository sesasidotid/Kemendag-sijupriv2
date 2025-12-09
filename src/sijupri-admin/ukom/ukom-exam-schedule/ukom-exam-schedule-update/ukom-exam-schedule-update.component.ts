import {
    Component,
    EventEmitter,
    Input,
    Output,
    inject,
    signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { UpdateExamScheduleRequest } from '@/modules/ukom/models/exam-schedule/update-exam-schedule-request.model'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { Observable } from 'rxjs'
import { JenisUkom } from '@/modules/ukom/models/jenis-ukom'
import { finalize } from 'rxjs/operators'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-ukom-exam-schedule-update',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LoadingButtonComponent],
    templateUrl: './ukom-exam-schedule-update.component.html',
    styleUrl: './ukom-exam-schedule-update.component.scss',
})
export class UkomExamScheduleUpdateComponent {
    @Output() refresh = new EventEmitter<void>()

    ukomExamScheduleService = inject(UkomExamScheduleService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    formValidationService = inject(FormValidationService)
    fb = inject(FormBuilder)

    examScheduleForm: FormGroup
    submitLoading = signal(false)
    jenisUkomList$: Observable<JenisUkom[]>

    examScheduleId: string

    @Input() examSchedule: ExamSchedule

    constructor() {
        this.jenisUkomList$ = this.ukomMiscellaneousService.getExamType()
        this.initForm()
    }

    ngOnChanges() {
        if (this.examSchedule) {
            this.examScheduleId = this.examSchedule.id
            this.examScheduleForm.patchValue({
                startTime: this.examSchedule.startTime,
                endTime: this.examSchedule.endTime,
                duration: this.examSchedule.duration
                    ? Math.round(this.examSchedule.duration * 60)
                    : 0,
                secretKey: this.examSchedule.secretKey,
            })

            this.examScheduleForm.get('secretKey')?.updateValueAndValidity()
        }
    }

    initForm() {
        this.examScheduleForm = this.fb.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            duration: ['', Validators.required],
            secretKey: [null, this.catValidator()],
        })

        this.examScheduleForm
            .get('examTypeCode')
            ?.valueChanges.subscribe((examType) => {
                const secretKeyControl = this.examScheduleForm.get('secretKey')
                if (examType !== 'CAT') {
                    secretKeyControl?.setValue(null)
                }
                secretKeyControl?.updateValueAndValidity()
            })
    }

    catValidator() {
        return (control: FormControl) => {
            if (!this.examSchedule) return null

            const examTypeValue = this.examSchedule.examTypeCode

            if (
                examTypeValue === 'CAT' &&
                (!control.value || control.value.toString().trim() === '')
            ) {
                return { required: true }
            }

            return null
        }
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading.set(true)
                const request = new UpdateExamScheduleRequest(
                    this.examScheduleForm.value,
                )
                request.id = this.examScheduleId

                if (request.duration) {
                    request.duration = Number(
                        (request.duration / 60).toFixed(2),
                    )
                }

                this.ukomExamScheduleService
                    .updateExamSchedule(request)
                    .pipe(
                        finalize(() => {
                            this.submitLoading.set(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Jadwal ujian berhasil diperbarui',
                            )
                            this.refresh.emit()
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal memperbarui jadwal ujian',
                            )
                        },
                    })
            },
        })
    }

    getError(controlName: string, label: string) {
        const control = this.examScheduleForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    isCatExamType(): boolean {
        return this.examSchedule?.examTypeCode === 'CAT'
    }

    generateSecretKey(): void {
        const examType = this.examSchedule?.examTypeCode

        if (examType !== 'CAT') {
            this.handlerService.handleAlert(
                'Warning',
                'Hanya ujian dengan jenis CAT yang memerlukan secret key.',
            )
            return
        }

        const randomKey = Array(6)
            .fill(0)
            .map(() => Math.random().toString(36).charAt(2))
            .join('')

        this.examScheduleForm.get('secretKey')?.setValue(randomKey)
    }
}
