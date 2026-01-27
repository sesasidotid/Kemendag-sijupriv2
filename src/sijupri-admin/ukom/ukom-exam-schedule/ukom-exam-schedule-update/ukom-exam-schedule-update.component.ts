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

interface DynamicFieldConfig {
    controlName: string
    validators?: any[]
    visible?: boolean
    required?: boolean
}

interface ExamTypeFormConfig {
    primary: DynamicFieldConfig[]
}

const UKOM_UPDATE_FORM_CONFIG: Record<string, ExamTypeFormConfig> = {
    CAT: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            {
                controlName: 'duration',
                validators: [Validators.required, Validators.min(1)],
            },
            { controlName: 'secretKey', validators: [Validators.required] },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
        ],
    },
    WAWANCARA: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            {
                controlName: 'duration',
                validators: [Validators.required, Validators.min(1)],
            },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
            {
                controlName: 'examinerIdList',
                validators: [Validators.required],
            },
        ],
    },
    MAKALAH: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
            {
                controlName: 'examinerIdList',
                validators: [Validators.required],
            },
        ],
    },
    SEMINAR: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            {
                controlName: 'duration',
                validators: [Validators.required, Validators.min(1)],
            },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
            {
                controlName: 'examinerIdList',
                validators: [Validators.required],
            },
        ],
    },
    PRAKTIK: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
            {
                controlName: 'examinerIdList',
                validators: [Validators.required],
            },
        ],
    },
    PORTOFOLIO: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
            {
                controlName: 'examinerIdList',
                validators: [Validators.required],
            },
        ],
    },
    STUDI_KASUS: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            { controlName: 'secretKey', validators: [Validators.required] },
            {
                controlName: 'participantIdList',
                visible: true,
                required: false,
            },
            {
                controlName: 'examinerIdList',
                validators: [Validators.required],
            },
        ],
    },
}

const ALL_FORM_FIELDS = [
    'startTime',
    'endTime',
    'duration',
    'secretKey',
    'participantIdList',
    'examinerIdList',
]

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
            startTime: [''],
            endTime: [''],
            duration: [''],
            secretKey: [null],
            participantIdList: [null],
            examinerIdList: [null],
        })
    }

    applyValidatorsForExamType(examType: string) {
        const config = UKOM_UPDATE_FORM_CONFIG[examType]
        if (!config) return

        const primaryControls = new Set(
            config.primary.map((c) => c.controlName),
        )

        // Clear validators for all configurable fields
        ALL_FORM_FIELDS.forEach((fieldName) => {
            const control = this.examScheduleForm.get(fieldName)
            if (control) {
                control.clearValidators()
                // Clear value if not in current config
                if (!primaryControls.has(fieldName)) {
                    control.setValue(null)
                }
            }
        })

        // Apply validators from primary config
        config.primary.forEach((fieldConfig) => {
            const control = this.examScheduleForm.get(fieldConfig.controlName)
            if (control && fieldConfig.validators) {
                control.setValidators(fieldConfig.validators)
            }
        })

        // Update validity
        ALL_FORM_FIELDS.forEach((fieldName) => {
            this.examScheduleForm.get(fieldName)?.updateValueAndValidity()
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
                    this.applyValidatorsForExamType(examSchedule.examTypeCode)
                    this.patchForm(examSchedule)
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

    isFieldVisible(controlName: string): boolean {
        const config = UKOM_UPDATE_FORM_CONFIG[this.examTypeCode]
        if (!config) return false

        const primaryField = config.primary.find(
            (f) => f.controlName === controlName,
        )
        if (primaryField) {
            return primaryField.visible !== false
        }

        return false
    }

    isFieldRequired(controlName: string): boolean {
        const config = UKOM_UPDATE_FORM_CONFIG[this.examTypeCode]
        if (!config) return false

        const primaryField = config.primary.find(
            (f) => f.controlName === controlName,
        )
        if (primaryField) {
            if (primaryField.required !== undefined) {
                return primaryField.required
            }
            return (
                primaryField.validators?.includes(Validators.required) ?? false
            )
        }

        return false
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
        if (!this.isFieldVisible('secretKey')) {
            this.handlerService.handleAlert(
                'Warning',
                'Jenis ujian ini tidak memerlukan secret key.',
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
