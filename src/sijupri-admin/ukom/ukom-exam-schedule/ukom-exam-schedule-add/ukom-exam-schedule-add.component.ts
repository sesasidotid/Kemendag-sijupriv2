import { CommonModule, Location } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ActivatedRoute, Router } from '@angular/router'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { finalize, map } from 'rxjs/operators'
import { JenisUkom } from '@/modules/ukom/models/jenis-ukom'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { TabService } from '@/modules/base/services/tab.service'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { ExamSchedule } from '@/modules/ukom/models/exam-schedule/exam-schedule.model'
import { DurationPipe } from '@/modules/base/pipes/duration.pipe'
import { UkomExamScheduleUpdateComponent } from '../ukom-exam-schedule-update/ukom-exam-schedule-update.component'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import {
    MultiSelectComponent,
    MultiSelectOption,
} from '@/modules/base/components/multi-select'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import {
    BaseExamScheduleRequest,
    CatExamScheduleRequest,
    OtherExamScheduleRequest,
    PraktikExamScheduleRequest,
    SeminarMakalahExamScheduleRequest,
    WawancaraExamScheduleRequest,
} from '@/modules/ukom/models/exam-schedule/create-exam-schedule-request.model'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { RoomParticipant } from '@/modules/ukom/models/room/room-participant.model'
import { UkomExaminerService } from '@/modules/ukom/services/ukom-examiner.service'
import { RoomExmainer } from '@/modules/ukom/models/room/room-examiner.model'

interface DynamicFieldConfig {
    controlName: string
    validators?: any[]
    visible?: boolean
    required?: boolean
}

interface ExamTypeFormConfig {
    primary: DynamicFieldConfig[]
    secondary?: {
        fields: DynamicFieldConfig[]
        label: string
        examTypeCode: string
    }
}

const UKOM_FORM_CONFIG: Record<string, ExamTypeFormConfig> = {
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
        ],
    },
    MAKALAH: {
        primary: [
            { controlName: 'startTime', validators: [Validators.required] },
            { controlName: 'endTime', validators: [Validators.required] },
            { controlName: 'participantIdList', validators: [] },
        ],
        secondary: {
            label: 'Jadwal Seminar',
            examTypeCode: 'SEMINAR',
            fields: [
                {
                    controlName: 'startTime2',
                    validators: [Validators.required],
                },
                { controlName: 'endTime2', validators: [Validators.required] },
                {
                    controlName: 'duration2',
                    validators: [Validators.required, Validators.min(1)],
                },
            ],
        },
    },
    PRAKTIK: {
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
        ],
    },
}

@Component({
    selector: 'app-ukom-exam-schedule-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
        PagableComponent,
        UkomExamScheduleUpdateComponent,
        ModalComponent,
        LoadingButtonComponent,
        MultiSelectComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-exam-schedule-add.component.html',
    styleUrl: './ukom-exam-schedule-add.component.scss',
})
export class UkomExamScheduleAddComponent implements OnInit {
    isUpdateModalOpen = signal(false)
    selectedExamSchedule: ExamSchedule

    location = inject(Location)
    tabService = inject(TabService)
    ukomExamScheduleService = inject(UkomExamScheduleService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    participantService = inject(UkomParticipantService)
    durationPipe = inject(DurationPipe)
    ukomExaminerService = inject(UkomExaminerService)

    examScheduleForm: FormGroup
    submitLoading = signal(false)

    jenisUkomList$: Observable<JenisUkom[]>

    roomId: string
    pagable: Pagable
    refresh: boolean = false

    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    participants: MultiSelectOption[] = []
    examinerInRoom = signal<RoomExmainer[]>([])

    constructor(
        private confirmationService: ConfirmationService,
        private router: Router,
        private handlerService: HandlerService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.jenisUkomList$ = this.ukomMiscellaneousService.getExamType()

        this.activatedRoute.paramMap.subscribe((params) => {
            this.roomId = params.get('id')
            this.initPagable()
            this.getParticipantListOptions()
            this.getExaminerList()
        })
        this.initTabs()
        this.initForm()
    }

    initPagable() {
        this.pagable = new PagableBuilder(
            `/api/v1/exam_schedule/room/${this.roomId}`,
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Waktu Mulai', (data: ExamSchedule) => {
                        const formattedDate = this.tanggalWaktuPipe.transform(
                            data.startTime,
                        )

                        return formattedDate
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Waktu selesai', (data: ExamSchedule) => {
                        const formattedDate = this.tanggalWaktuPipe.transform(
                            data.endTime,
                        )

                        return formattedDate
                    })
                    .build(),
            )
            // .addPrimaryColumn(
            //     new PrimaryColumnBuilder()
            //         .withDynamicValue('Jenis Ukom', (data: ExamSchedule) => {
            //             if (data.examScheduleChild){}
            //             return this.ukomMiscellaneousService.getModuleDisplayName(
            //                 data.examTypeCode,
            //             )
            //         })
            //         .build(),
            // )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: ExamSchedule) => {
                        const allSchedules = [
                            data,
                            ...(data.examScheduleChild
                                ? [data.examScheduleChild]
                                : []),
                        ]

                        return allSchedules
                            .map((item) =>
                                this.ukomMiscellaneousService.getModuleDisplayName(
                                    item.examTypeCode,
                                ),
                            )
                            .join(' / ')
                    })
                    .build(),
            )
            // .addPrimaryColumn(
            //     new PrimaryColumnBuilder()
            //         .withDynamicValue('Penguji', (data: ExamSchedule) => {
            //             return this.mapExaminersToNames(data.examiners)
            //         })
            //         .withTitle((data: ExamSchedule) => {
            //             return this.mapExaminersToNames(data.examiners)
            //         })
            //         .build(),
            // )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Penguji', (data: ExamSchedule) => {
                        const mergedExaminers = this.mergeExaminerStrings(
                            data.examiners,
                            data.examScheduleChild?.examiners,
                        )

                        return this.mapExaminersToNames(mergedExaminers)
                    })
                    .withTitle((data: ExamSchedule) => {
                        const mergedExaminers = this.mergeExaminerStrings(
                            data.examiners,
                            data.examScheduleChild?.examiners,
                        )

                        return this.mapExaminersToNames(mergedExaminers)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Durasi', (data: ExamSchedule) => {
                        const duration =
                            data.examScheduleChild?.duration ?? data.duration

                        return this.durationPipe.transform(duration)
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Secret Key', 'secretKey').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: ExamSchedule) => {
                        this.router.navigate(
                            [
                                `ukom/ukom-room-list/${this.roomId}/competence/${item.id}`,
                            ],
                            { queryParams: { type_ukom: item.examTypeCode } },
                        )
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: ExamSchedule) => {
                        this.selectedExamSchedule = item
                        this.isUpdateModalOpen.set(true)
                    }, 'primary')
                    .withIcon('update')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: ExamSchedule) => {
                        this.deleteExamSchedule(item.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    initTabs() {
        this.tabService
            .addTab({
                label: 'Detail Kelas',
                icon: 'mdi-list-box',
                onClick: () => this.handleTabChange(),
            })
            .addTab({
                label: 'Tambah Jadwal UKom',
                icon: 'mdi-plus-circle',
                isActive: true,
                onClick: () => {},
            })
    }

    initForm() {
        this.examScheduleForm = this.fb.group({
            examTypeCode: ['', Validators.required],
            startTime: [''],
            endTime: [''],
            duration: [''],
            secretKey: [null],
            participantIdList: [null],
            // Secondary form fields for MAKALAH/SEMINAR
            startTime2: [''],
            endTime2: [''],
            duration2: [''],
            participantIdList2: [null],
        })

        this.examScheduleForm
            .get('examTypeCode')
            ?.valueChanges.subscribe((examType) => {
                const config = UKOM_FORM_CONFIG[examType]
                if (!config) return

                const primaryControls = new Set(
                    config.primary.map((c) => c.controlName),
                )
                const secondaryControls = new Set(
                    config.secondary?.fields.map((c) => c.controlName) || [],
                )
                const allConfiguredControls = new Set([
                    ...primaryControls,
                    ...secondaryControls,
                ])

                // Clear validators for all configurable fields
                const allFields = [
                    'startTime',
                    'endTime',
                    'duration',
                    'secretKey',
                    'participantIdList',
                    'startTime2',
                    'endTime2',
                    'duration2',
                    'participantIdList2',
                ]
                allFields.forEach((fieldName) => {
                    const control = this.examScheduleForm.get(fieldName)
                    if (control) {
                        control.clearValidators()
                        // Clear value if not in current config
                        if (!allConfiguredControls.has(fieldName)) {
                            control.setValue(null)
                        }
                    }
                })

                // Apply validators from primary config
                config.primary.forEach((fieldConfig) => {
                    const control = this.examScheduleForm.get(
                        fieldConfig.controlName,
                    )
                    if (control && fieldConfig.validators) {
                        control.setValidators(fieldConfig.validators)
                    }
                })

                // Apply validators from secondary config if exists
                if (config.secondary) {
                    config.secondary.fields.forEach((fieldConfig) => {
                        const control = this.examScheduleForm.get(
                            fieldConfig.controlName,
                        )
                        if (control && fieldConfig.validators) {
                            control.setValidators(fieldConfig.validators)
                        }
                    })
                }

                // Update validity
                allFields.forEach((fieldName) => {
                    this.examScheduleForm
                        .get(fieldName)
                        ?.updateValueAndValidity()
                })
            })
    }

    getParticipantListOptions() {
        this.participantService
            .getParticipantListByRoomUkomId(this.roomId)
            .pipe(
                map((participants: RoomParticipant[]) =>
                    participants.map((p) => ({
                        id: p.participantUkom?.id,
                        label: `${p.participantUkom?.name} (${p.participantUkom?.nip})`,
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

    getExaminerList() {
        this.ukomExaminerService.fetchExaminerByRoomId(this.roomId).subscribe({
            next: (examinerList) => {
                this.examinerInRoom.set(examinerList)
            },
            error: (err) => {
                console.error(err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal memuat daftar penguji',
                )
            },
        })
    }

    handleTabChange() {
        this.router.navigate(['../'], {
            relativeTo: this.activatedRoute,
            replaceUrl: true,
        })
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }

    getError(controlName: string, label: string) {
        const control = this.examScheduleForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    hasSecondaryForm(): boolean {
        const examType = this.examScheduleForm.get('examTypeCode')?.value
        return !!UKOM_FORM_CONFIG[examType]?.secondary
    }

    getSecondaryFormLabel(): string {
        const examType = this.examScheduleForm.get('examTypeCode')?.value
        return UKOM_FORM_CONFIG[examType]?.secondary?.label || ''
    }

    isFieldVisible(controlName: string): boolean {
        const examType = this.examScheduleForm.get('examTypeCode')?.value
        const config = UKOM_FORM_CONFIG[examType]
        if (!config) return false

        // Check primary fields
        const primaryField = config.primary.find(
            (f) => f.controlName === controlName,
        )
        if (primaryField) {
            return primaryField.visible !== false
        }

        // Check secondary fields
        const secondaryField = config.secondary?.fields.find(
            (f) => f.controlName === controlName,
        )
        if (secondaryField) {
            return secondaryField.visible !== false
        }

        return false
    }

    isFieldRequired(controlName: string): boolean {
        const examType = this.examScheduleForm.get('examTypeCode')?.value
        const config = UKOM_FORM_CONFIG[examType]
        if (!config) return false

        // Check primary fields
        const primaryField = config.primary.find(
            (f) => f.controlName === controlName,
        )
        if (primaryField) {
            // If explicit required property exists, use it
            if (primaryField.required !== undefined) {
                return primaryField.required
            }
            // Otherwise check if Validators.required is in the validators array
            return (
                primaryField.validators?.includes(Validators.required) ?? false
            )
        }

        // Check secondary fields
        const secondaryField = config.secondary?.fields.find(
            (f) => f.controlName === controlName,
        )
        if (secondaryField) {
            // If explicit required property exists, use it
            if (secondaryField.required !== undefined) {
                return secondaryField.required
            }
            // Otherwise check if Validators.required is in the validators array
            return (
                secondaryField.validators?.includes(Validators.required) ??
                false
            )
        }

        return false
    }

    generateSecretKey(): void {
        const randomKey = Array(6)
            .fill(0)
            .map(() => Math.random().toString(36).charAt(2))
            .join('')

        this.examScheduleForm.get('secretKey')?.setValue(randomKey)
    }

    deleteExamSchedule(examScheduleId: string) {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.ukomExamScheduleService
                    .deleteExamScheduleById(examScheduleId)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Jadwal ujian berhasil dihapus',
                            )
                            this.refresh = !this.refresh
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus jadwal ujian',
                            )
                        },
                    })
            },
        })
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading.set(true)

                const examType =
                    this.examScheduleForm.get('examTypeCode')?.value

                const request = this.buildPrimaryRequest(examType)
                request.roomUkomId = this.roomId

                // normalize duration
                if ((request as any).duration) {
                    ;(request as any).duration = Number(
                        ((request as any).duration / 60).toFixed(4),
                    )
                }

                this.ukomExamScheduleService
                    .createExamSchedule(examType, request)
                    .pipe(finalize(() => this.submitLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Jadwal ujian berhasil dibuat',
                            )
                            this.examScheduleForm.reset()
                            this.refresh = !this.refresh
                        },
                        error: (err) => this.handleCreateError(err),
                    })
            },
        })
    }

    toggleUpdateModal() {
        this.isUpdateModalOpen.set(!this.isUpdateModalOpen())
    }

    private handleCreateError(err: any): void {
        console.error(err)

        const errorCode = err?.error?.code
        const message = err?.error?.message
        const params = err?.error?.params

        switch (errorCode) {
            case 'ESS-00001':
                this.handlerService.handleAlert(
                    'Error',
                    'Jumlah slot waktu tidak mencukupi untuk semua peserta',
                )
                break

            case 'RCD-00002':
                if (message == 'participant already have a shcedule') {
                    this.handlerService.handleAlert(
                        'Error',
                        `Terdeteksi konflik jadwal ujian peserta dengan nama ${params?.name} (${params?.nip})`,
                    )
                } else {
                    this.handlerService.handleAlert(
                        'Error',
                        'Terdeteksi konflik jadwal ujian penguji',
                    )
                }

                break

            default:
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal membuat jadwal ujian',
                )
        }
    }

    private buildPrimaryRequest(examType: string): BaseExamScheduleRequest {
        const v = this.examScheduleForm.value

        switch (examType) {
            case ExamTypeCategory.CAT:
                return new CatExamScheduleRequest({
                    startTime: v.startTime,
                    endTime: v.endTime,
                    duration: v.duration,
                    secretKey: v.secretKey,
                    participantIdList: v.participantIdList ?? [],
                })

            case ExamTypeCategory.WAWANCARA:
                return new WawancaraExamScheduleRequest({
                    startTime: v.startTime,
                    endTime: v.endTime,
                    duration: v.duration,
                    participantIdList: v.participantIdList ?? [],
                })

            case ExamTypeCategory.MAKALAH:
                return new SeminarMakalahExamScheduleRequest({
                    makalahStartTime: v.startTime,
                    makalahEndTime: v.endTime,
                    seminarStartTime: v.startTime2,
                    seminarEndTime: v.endTime2,
                    duration: v.duration2,
                    participantIdList: v.participantIdList ?? [],
                })
            case ExamTypeCategory.PRAKTIK:
                return new PraktikExamScheduleRequest({
                    startTime: v.startTime,
                    endTime: v.endTime,
                    duration: v.duration,
                    participantIdList: v.participantIdList ?? [],
                })
            default:
                return new OtherExamScheduleRequest({
                    startTime: v.startTime,
                    endTime: v.endTime,
                    participantIdList: v.participantIdList ?? [],
                    secretKey: v.secretKey,
                })
        }
    }

    private mapExaminerIdToName(examinerId: string): string {
        const examiner = this.examinerInRoom().find(
            (item) => item.examinerId === examinerId,
        )

        return examiner?.examinerUkom?.user?.name ?? examinerId
    }

    private mergeExaminerStrings(
        parent?: string,
        child?: string,
    ): string | undefined {
        const allIds = [
            ...(parent?.split(',') ?? []),
            ...(child?.split(',') ?? []),
        ]
            .map((id) => id.trim())
            .filter(Boolean)

        const unique = [...new Set(allIds)]

        return unique.length ? unique.join(',') : undefined
    }
    private mapExaminersToNames(examiners?: string): string {
        if (!examiners) return '-'

        const uniqueExaminerIds = [
            ...new Set(
                examiners
                    .split(',')
                    .map((examinerId) => examinerId.trim())
                    .filter((examinerId) => !!examinerId),
            ),
        ]

        const examinerNames = uniqueExaminerIds.map((examinerId) =>
            this.mapExaminerIdToName(examinerId),
        )

        return examinerNames.length > 0 ? examinerNames.join(', ') : '-'
    }
}
