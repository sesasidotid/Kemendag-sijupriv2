import {
    Component,
    effect,
    inject,
    input,
    OnInit,
    output,
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
import { finalize, map } from 'rxjs/operators'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { UkomExaminerService } from '@/modules/ukom/services/ukom-examiner.service'
import {
    MultiSelectComponent,
    MultiSelectOption,
} from '@/modules/base/components/multi-select'
import {
    MultiSelectApiComponent,
    MultiSelectApiParams,
} from '@/modules/base/components/multi-select-api'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'

@Component({
    selector: 'app-ukom-exam-schedule-update',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        MultiSelectComponent,
        MultiSelectApiComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-exam-schedule-update.component.html',
    styleUrl: './ukom-exam-schedule-update.component.scss',
})
export class UkomExamScheduleUpdateComponent implements OnInit {
    refresh = output<void>()
    examScheduleId = input<string>()
    roomUkomId = input<string>()

    ukomExamScheduleService = inject(UkomExamScheduleService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    handlerService = inject(HandlerService)
    confirmationService = inject(ConfirmationService)
    formValidationService = inject(FormValidationService)
    participantService = inject(UkomParticipantService)
    examinerService = inject(UkomExaminerService)
    fb = inject(FormBuilder)

    examScheduleForm: FormGroup
    dataLoading = signal(false)
    submitLoading = signal(false)
    jenisUkomList$: Observable<JenisUkom[]>
    participants: MultiSelectOption[] = []
    selectedExaminers: MultiSelectOption[] = []

    examSchedule: ExamSchedule

    get examTypeCode() {
        return this.examSchedule?.examTypeCode
    }

    get isCatExamType(): boolean {
        return this.examTypeCode === 'CAT'
    }

    constructor() {
        effect(() => {
            const id = this.roomUkomId()
            if (id) {
                this.getParticipantListOptions(id)
            }
        })
        effect(
            () => {
                const id = this.examScheduleId()
                if (id) {
                    this.getExamScheduleDetail(id)
                }
            },
            { allowSignalWrites: true },
        )
    }

    ngOnInit() {
        this.jenisUkomList$ = this.ukomMiscellaneousService.getExamType()
        this.initForm()
    }

    initForm() {
        this.examScheduleForm = this.fb.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            duration: ['', Validators.required],
            secretKey: [null, this.catValidator()],
            participantIdList: [null],
            examinerIdList: [null, this.examinerRequiredWhenNotCat()],
        })
    }

    getParticipantListOptions(roomUkomId: string) {
        this.participantService
            .getParticipantListByRoomUkomId(roomUkomId)
            .pipe(
                map((participants) =>
                    participants.map((p) => ({
                        id: p.id,
                        label: `${p.name} (${p.nip})`,
                    })),
                ),
            )
            .subscribe({
                next: (options) => {
                    this.participants = options
                },
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat daftar peserta',
                    )
                },
            })
    }

    fetchExaminers = (params: MultiSelectApiParams): Observable<any> => {
        const searchName = params['like_user|name'] || ''

        return this.examinerService
            .searchExaminer(params.limit, params.page, searchName)
            .pipe(
                map((response) => {
                    if (response && response.data) {
                        return {
                            ...response,
                            data: response.data.map((examiner) => ({
                                id: examiner.id,
                                label: examiner.user?.name || examiner.id,
                            })),
                        }
                    }
                    return response
                }),
            )
    }

    getExamScheduleDetail(id: string) {
        this.dataLoading.set(true)
        this.ukomExamScheduleService
            .getExamScheduleDetailById(id)
            .pipe(
                finalize(() => {
                    this.dataLoading.set(false)
                }),
            )
            .subscribe({
                next: (examSchedule) => {
                    this.examSchedule = examSchedule
                    this.patchForm(examSchedule)
                    this.updateValidatorsBasedOnExamType()
                },
                error: (error) => {
                    console.error(error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat detail jadwal ujian',
                    )
                },
            })
    }

    private updateValidatorsBasedOnExamType() {
        const secretKeyControl = this.examScheduleForm.get('secretKey')
        const examinerControl = this.examScheduleForm.get('examinerIdList')

        if (this.examTypeCode !== 'CAT') {
            secretKeyControl?.setValue(null)
        }

        secretKeyControl?.updateValueAndValidity()
        examinerControl?.updateValueAndValidity()
    }

    catValidator() {
        return (control: FormControl) => {
            if (!this.examSchedule) return null

            const examTypeValue = this.examTypeCode

            if (
                examTypeValue === 'CAT' &&
                (!control.value || control.value.toString().trim() === '')
            ) {
                return { required: true }
            }

            return null
        }
    }

    examinerRequiredWhenNotCat() {
        return (control: FormControl) => {
            if (!control.parent) {
                return null
            }

            const examType = this.examTypeCode

            if (
                examType !== 'CAT' &&
                (!control.value || control.value.length === 0)
            ) {
                return { required: true }
            }

            return null
        }
    }

    patchForm(data: ExamSchedule) {
        // Extract participant IDs from participantScheduleList
        const participantIds = data.participantScheduleList
            ? data.participantScheduleList.map((p) => p.participantId)
            : []

        // Extract examiner IDs and cache examiner data for display
        const examinerIds = data.examinerScheduleList
            ? data.examinerScheduleList.map((e) => e.examinerId)
            : []

        // Cache examiner data so multi-select-api can display labels
        this.selectedExaminers = data.examinerScheduleList
            ? data.examinerScheduleList.map((e) => ({
                  id: e.examinerId,
                  label: e.examinerUkom?.user?.name,
              }))
            : []

        this.examScheduleForm.patchValue({
            startTime: data.startTime,
            endTime: data.endTime,
            duration: data.duration ? Math.round(data.duration * 60) : 0,
            secretKey: data.secretKey,
            participantIdList: participantIds,
            examinerIdList: examinerIds,
        })

        this.examScheduleForm.get('secretKey')?.updateValueAndValidity()
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading.set(true)
                const request = new UpdateExamScheduleRequest(
                    this.examScheduleForm.value,
                )
                request.id = this.examScheduleId()

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
