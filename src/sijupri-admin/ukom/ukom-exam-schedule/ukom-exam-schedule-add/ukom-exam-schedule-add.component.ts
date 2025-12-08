import { CommonModule, Location } from '@angular/common'
import { Component, EventEmitter, inject, Output } from '@angular/core'
import { LucideAngularModule, FilePlus } from 'lucide-angular'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
    FormArray,
} from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { Router, ActivatedRoute } from '@angular/router'
import { ApiService } from '@/modules/base/services/api.service'
import { ExamScheduleUkom } from '@/modules/ukom/models/schedule.model'
import { HandlerService } from '@/modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
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

@Component({
    selector: 'app-ukom-exam-schedule-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
        PagableComponent,
    ],
    templateUrl: './ukom-exam-schedule-add.component.html',
    styleUrl: './ukom-exam-schedule-add.component.scss',
})
export class UkomExamScheduleAddComponent {
    location = inject(Location)
    tabService = inject(TabService)

    examScheduleForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)
    loadingDefaultData$ = new BehaviorSubject<boolean>(false)

    examScheduleData: ExamScheduleUkom = new ExamScheduleUkom()
    jenisUkomList$: Observable<JenisUkom[]>

    id: string
    pagable: Pagable
    readonly filePlus = FilePlus
    refreshToggle: boolean = false
    ukom_type?: string

    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    constructor(
        private confirmationService: ConfirmationService,
        private router: Router,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private activatedRoute: ActivatedRoute,
        private fb: FormBuilder,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((params) => {
            this.id = params.get('id')
        })
        this.initTabs()
        this.handleFormInit()
        this.handlePagable()
        this.getJenisUkomList()
        this.loadDefaultScheduleData()
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
    loadDefaultScheduleData() {
        this.loadingDefaultData$.next(true)

        this.apiService
            .getData(`/api/v1/exam_schedule/room/${this.id}?page=1&limit=10`)
            .subscribe({
                next: (response: any[]) => {
                    while (this.schedules.length !== 0) {
                        this.schedules.removeAt(0)
                    }
                    if (response && response.length > 0) {
                        response.forEach((schedule) => {
                            let durationInMinutes = null

                            if (
                                schedule.examTypeCode === 'CAT' &&
                                schedule.duration
                            ) {
                                durationInMinutes = Math.round(
                                    schedule.duration * 60,
                                )
                            }

                            const scheduleGroup = this.fb.group({
                                start_time: [
                                    schedule.startTime,
                                    Validators.required,
                                ],
                                end_time: [
                                    schedule.endTime,
                                    Validators.required,
                                ],
                                exam_type_code: [
                                    schedule.examTypeCode || '',
                                    Validators.required,
                                ],
                                duration: [
                                    durationInMinutes || null,
                                    this.catValidator(),
                                ],
                                secret_key: [
                                    schedule.secretKey || '',
                                    this.catValidator(),
                                ],
                            })
                            this.schedules.push(scheduleGroup)
                        })
                    } else {
                        this.addSchedule()
                    }

                    this.loadingDefaultData$.next(false)
                },
                error: (error) => {
                    console.error('Error loading default schedule data:', error)
                    this.addSchedule()
                    this.loadingDefaultData$.next(false)
                },
            })
    }

    // Custom validator for CAT exam type duration
    catValidator() {
        return (control: FormControl) => {
            if (!control.parent) {
                return null
            }

            const examTypeValue = control.parent.get('exam_type_code')?.value

            if (
                examTypeValue === 'CAT' &&
                (!control.value || control.value.toString().trim() === '')
            ) {
                return { required: true }
            }

            return null
        }
    }

    handleFormInit() {
        this.examScheduleForm = this.fb.group({
            schedules: this.fb.array([], [Validators.required]),
        })
    }

    handlePagable() {
        this.pagable = new PagableBuilder(
            `/api/v1/exam_schedule/room/${this.id}`,
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Waktu Mulai', (data: any) => {
                        const formattedDate = this.tanggalWaktuPipe.transform(
                            data.startTime,
                        )

                        return formattedDate
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Waktu selesai', (data: any) => {
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
                    .withDynamicValue('Durasi', (data: any) => {
                        if (data.examTypeCode === 'CAT' && data.duration) {
                            return `${Math.round(data.duration * 60)} menit`
                        } else {
                            return '-'
                        }
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Secret Key', 'secretKey').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: any) => {
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
            .build()
    }

    getJenisUkomList() {
        this.jenisUkomList$ = this.apiService
            .getData(`/api/v1/exam_type`)
            .pipe(
                map((response) =>
                    response.map(
                        (jenisUkom: { [key: string]: any }) =>
                            new JenisUkom(jenisUkom),
                    ),
                ),
            )
    }

    getError(controlName: string, label: string) {
        const control = this.examScheduleForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    getScheduleError(index: number, controlName: string, label: string) {
        const control = (
            this.examScheduleForm.get('schedules') as any
        ).controls[index].get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    get schedules() {
        return this.examScheduleForm.get('schedules') as FormArray
    }

    addSchedule(): void {
        const scheduleGroup = this.fb.group({
            start_time: ['', Validators.required],
            end_time: ['', Validators.required],
            exam_type_code: ['', Validators.required],
            duration: [null, this.catValidator()],
            secret_key: [null, this.catValidator()],
        })

        scheduleGroup
            .get('exam_type_code')
            ?.valueChanges.subscribe((examType) => {
                const durationControl = scheduleGroup.get('duration')
                const secretKeyControl = scheduleGroup.get('secret_key')

                if (examType !== 'CAT') {
                    durationControl?.setValue(null)
                    secretKeyControl?.setValue(null)
                }

                durationControl?.updateValueAndValidity()
                secretKeyControl?.updateValueAndValidity()
            })

        this.schedules.push(scheduleGroup)
    }

    removeSchedule(index: number): void {
        this.schedules.removeAt(index)
    }

    getAvailableExamTypes(selectedCode: string): Observable<JenisUkom[]> {
        return this.jenisUkomList$.pipe(
            map((jenisUkomList) => {
                const selectedCodes = this.schedules.value.map(
                    (schedule: any) => schedule.exam_type_code,
                )
                return jenisUkomList.filter(
                    (jenisUkom) =>
                        !selectedCodes.includes(jenisUkom.code) ||
                        jenisUkom.code === selectedCode,
                )
            }),
        )
    }

    isCatExamType(index: number): boolean {
        const examTypeControl = this.schedules.at(index).get('exam_type_code')
        return examTypeControl?.value === 'CAT'
    }

    handleRefreshToggle() {
        this.refreshToggle = !this.refreshToggle
    }

    generateSecretKey(index: number): void {
        const scheduleGroup = this.schedules.at(index)
        if (!scheduleGroup) return

        const examType = scheduleGroup.get('exam_type_code')?.value
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

        scheduleGroup.get('secret_key')?.setValue(randomKey)
    }

    submit(): void {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading$.next(true)
                this.examScheduleData.id = this.id

                // const examTypeCodes = this.schedules.value.map(
                //     (schedule: any) => schedule.exam_type_code,
                // )
                // const hasDuplicate = examTypeCodes.some(
                //     (value: any, index: any) =>
                //         examTypeCodes.indexOf(value) !== index,
                // )

                // if (hasDuplicate) {
                //     this.handlerService.handleAlert(
                //         'Error',
                //         'Jenis UKOM tidak boleh sama',
                //     )
                //     this.submitLoading$.next(false)
                //     return
                // }

                const scheduleData = this.schedules.value.map(
                    (schedule: any) => {
                        if (
                            schedule.exam_type_code === 'CAT' &&
                            schedule.duration
                        ) {
                            return {
                                ...schedule,
                                duration: (schedule.duration / 60).toFixed(2),
                            }
                        }
                        return schedule
                    },
                )

                this.examScheduleData.examScheduleDtoList = scheduleData

                this.apiService
                    .postData(`/api/v1/exam_schedule`, this.examScheduleData)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            this.handleRefreshToggle()
                            this.submitLoading$.next(false)
                        },
                        error: (error) => {
                            this.handlerService.handleAlert(
                                'Error',
                                error.error.message,
                            )
                            this.submitLoading$.next(false)
                        },
                    })
            },
        })
    }
}
