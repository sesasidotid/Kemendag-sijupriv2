import { CommonModule, Location } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { FilePlus, LucideAngularModule } from 'lucide-angular'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ActivatedRoute, Router } from '@angular/router'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { CreateExamScheduleRequest } from '@/modules/ukom/models/exam-schedule/create-exam-schedule-request.model'
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
import {
    MultiSelectApiComponent,
    MultiSelectApiParams,
} from '@/modules/base/components/multi-select-api'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { UkomExaminerService } from '@/modules/ukom/services/ukom-examiner.service'

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
        MultiSelectApiComponent,
    ],
    templateUrl: './ukom-exam-schedule-add.component.html',
    styleUrl: './ukom-exam-schedule-add.component.scss',
})
export class UkomExamScheduleAddComponent implements OnInit {
    isUpdateModalOpen = false
    selectedExamSchedule: ExamSchedule

    location = inject(Location)
    tabService = inject(TabService)
    ukomExamScheduleService = inject(UkomExamScheduleService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    participantService = inject(UkomParticipantService)
    examinerService = inject(UkomExaminerService)
    durationPipe = inject(DurationPipe)

    examScheduleForm: FormGroup
    submitLoading = signal(false)

    jenisUkomList$: Observable<JenisUkom[]>

    id: string
    pagable: Pagable
    readonly filePlus = FilePlus
    refresh: boolean = false

    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    participants: MultiSelectOption[] = []

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
            this.id = params.get('id')
            this.initPagable()
            this.getParticipantListOptions()
        })
        this.initTabs()
        this.initForm()
    }

    getParticipantListOptions() {
        this.participantService
            .getParticipantListByRoomUkomId(this.id)
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
        // Extract search value from dynamic param
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

    catValidator() {
        return (control: FormControl) => {
            if (!control.parent) {
                return null
            }

            const examTypeValue = control.parent.get('examTypeCode')?.value

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

            const examType = control.parent.get('examTypeCode')?.value

            if (
                examType !== 'CAT' &&
                (!control.value || control.value.length === 0)
            ) {
                return { required: true }
            }

            return null
        }
    }

    initForm() {
        this.examScheduleForm = this.fb.group({
            startTime: ['', Validators.required],
            endTime: ['', Validators.required],
            examTypeCode: ['', Validators.required],
            duration: ['', Validators.required],
            secretKey: [null, this.catValidator()],
            participantIdList: [null],
            examinerIdList: [null, this.examinerRequiredWhenNotCat()],
        })

        this.examScheduleForm
            .get('examTypeCode')
            ?.valueChanges.subscribe((examType) => {
                const secretKeyControl = this.examScheduleForm.get('secretKey')
                const examinerControl =
                    this.examScheduleForm.get('examinerIdList')

                if (examType !== 'CAT') {
                    secretKeyControl?.setValue(null)
                }

                secretKeyControl?.updateValueAndValidity()
                examinerControl?.updateValueAndValidity()
            })
    }

    initPagable() {
        this.pagable = new PagableBuilder(
            `/api/v1/exam_schedule/room/${this.id}`,
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
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jenis Ukom', 'examTypeCode').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Durasi', (data: ExamSchedule) => {
                        return this.durationPipe.transform(data.duration)
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
                                `ukom/ukom-room-list/${this.id}/competence/${item.id}`,
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
                        this.isUpdateModalOpen = true
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

    getError(controlName: string, label: string) {
        const control = this.examScheduleForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    isCatExamType(): boolean {
        const examTypeControl = this.examScheduleForm.get('examTypeCode')
        return examTypeControl?.value === 'CAT'
    }

    generateSecretKey(): void {
        const examType = this.examScheduleForm.get('examTypeCode')?.value
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

                if (
                    this.examScheduleForm.getError('examTypeCode')?.value ===
                    'CAT'
                ) {
                    this.examScheduleForm.get('examinerIdList').setValue([])
                }

                const request = new CreateExamScheduleRequest(
                    this.examScheduleForm.value,
                )
                request.roomUkomId = this.id

                if (request.duration) {
                    request.duration = Number(
                        (request.duration / 60).toFixed(2),
                    )
                }

                this.ukomExamScheduleService
                    .createExamSchedule(request)
                    .pipe(
                        finalize(() => {
                            this.submitLoading.set(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Jadwal ujian berhasil dibuat',
                            )
                            this.examScheduleForm.reset()
                            this.refresh = !this.refresh
                        },
                        error: (err) => {
                            console.error(err)
                            if (err.error.code === 'ESS-00001') {
                                this.handlerService.handleAlert(
                                    'Error',
                                    'Jumlah slot waktu tidak mencukupi untuk semua peserta',
                                )
                                return
                            }
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal membuat jadwal ujian',
                            )
                        },
                    })
            },
        })
    }
}
