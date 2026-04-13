import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { Component, inject, OnInit, signal } from '@angular/core'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { TabService } from '@/modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { HandlerService } from '@/modules/base/services/handler.service'
import {
    BehaviorSubject,
    distinctUntilChanged,
    map,
    Observable,
    tap,
} from 'rxjs'
import { UkomClassAddComponent } from '../ukom-class-add/ukom-class-add.component'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { Jenjang } from '@/modules/maintenance/models/jenjang.modle'
import { ApiService } from '@/modules/base/services/api.service'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { BidangJabatan } from '@/modules/maintenance/models/bidang-jabatan.model'
import { RoomUkom } from '@/modules/ukom/models/room-ukom.model'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import {
    generateDemoScheduleData,
    ScheduleItem,
    ScheduleTimelineModalComponent,
} from '@/modules/base/components/schedule-timeline'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { UkomExamScheduleService } from '@/modules/ukom/services/ukom-exam-schedule.service'
import { ExamScheduleCalendar } from '@/modules/ukom/models/exam-schedule/exam-schedule-calendar.model'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'

@Component({
    selector: 'app-ukom-class-list',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        UkomClassAddComponent,
        ModalComponent,
        FormsModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        ScheduleTimelineModalComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-class-list.component.html',
    styleUrl: './ukom-class-list.component.scss',
})
export class UkomClassListComponent implements OnInit {
    route = inject(ActivatedRoute)
    tab = signal(0)

    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>
    fixedJenjangList$: Observable<Jenjang[]>

    jenjangMap: Record<string, string> = {}
    jabatanMap: Record<string, string> = {}

    bidangJabatanMap: Record<string, string> = {}
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    refreshToggle: boolean = false
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    editRoomUkomForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)
    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    isTimelineModalOpen = signal(false)
    timelineSchedules = signal<ScheduleItem[]>([])
    demoTimelineSchedules = signal<ScheduleItem[]>(generateDemoScheduleData())
    dateRangeForm: FormGroup
    isLoadingSchedules = signal(false)
    hasLoadedSchedules = signal(false)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    jenisUkomService = inject(JenisUkomService)
    private bidangJabatanListSubject = new BehaviorSubject<BidangJabatan[]>([])
    bidangJabatanList$ = this.bidangJabatanListSubject.asObservable()

    constructor(
        private tabService: TabService,
        private router: Router,
        private handlerService: HandlerService,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        private examScheduleService: UkomExamScheduleService,
    ) {
        // Initialize date range form
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        this.dateRangeForm = new FormGroup({
            startDate: new FormControl(this.formatDate(firstDay), [
                Validators.required,
            ]),
            endDate: new FormControl(this.formatDate(lastDay), [
                Validators.required,
            ]),
        })
    }

    ngOnInit() {
        this.handleTabService()
        this.handlePagable()
        this.handleFormInit()
        this.getJenjang()
        this.getJabatan()
        this.getBidangJabatan()

        this.handleSubscribe()
        this.handleBidangJabatanValidation()
    }

    handleBidangJabatanValidation() {
        this.bidangJabatanList$.subscribe((bidangJabatanList) => {
            const control = this.editRoomUkomForm.get('bidang_jabatan_code')
            if (!control) return

            const currentValidators = control.validator
                ? [control.validator]
                : []
            const isRequiredAlreadySet = currentValidators.some(
                (v) => v === Validators.required,
            )

            if (bidangJabatanList.length > 0 && !isRequiredAlreadySet) {
                control.setValidators([Validators.required])
            } else if (bidangJabatanList.length === 0) {
                control.clearValidators()
            }

            control.updateValueAndValidity({ emitEvent: false })
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.editRoomUkomForm.get(controlName),
            controlName,
            label,
        )
    }

    handlePagable() {
        this.pagable$.next(
            new PagableBuilder('/api/v1/room_ukom/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'name')
                        .withTitle((data: RoomUkom) => data.name)
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Kuota Peserta',
                        'participantQuota',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Mulai', (data: RoomUkom) => {
                            return this.tanggalWaktuPipe.transform(
                                data.examStartAt,
                            )
                        })
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Selesai', (data: RoomUkom) => {
                            return this.tanggalWaktuPipe.transform(
                                data.examEndAt,
                            )
                        })
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Jabatan',
                            (data: any) => this.jabatanMap[data.jabatanCode],
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Jenjang',
                            (data: any) =>
                                this.jenjangMap[data.jenjangCode] || '',
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Bidang Jabatan',
                            (data: any) =>
                                this.bidangJabatanMap[data.bidangJabatanCode] ||
                                '',
                        )
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((ukom: any) => {
                            this.goToDetail(ukom.id)
                        }, 'info')
                        .withIcon('detail')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((data: any) => {
                            this.setDefaultFormValues(data)
                            this.toggleModal()
                            this.getListJenjang()
                        }, 'primary')
                        .withIcon('update')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction(
                            (ukom: any) => this.deleteClass(ukom),
                            'danger',
                        )
                        .withIcon('danger')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('name')
                        .withField('Nama', 'text')
                        .build(),
                )
                .withQueryParams()
                .build(),
        )
    }

    goToDetail(roomId: string) {
        this.router.navigate([`${roomId}`], {
            relativeTo: this.route,
        })
    }

    handleSubscribe() {
        this.editRoomUkomForm
            .get('jabatan_code')
            ?.valueChanges.pipe(distinctUntilChanged())
            .subscribe((jabatanCode) => {
                const bidangJabatanControl = this.editRoomUkomForm.get(
                    'bidang_jabatan_code',
                )
                bidangJabatanControl?.reset()

                if (jabatanCode) {
                    this.getBidangJabatanByJabatanCode(jabatanCode)
                }
            })
    }

    getBidangJabatanByJabatanCode(jabatanCode: string): void {
        this.apiService
            .getData(`/api/v1/bidang_jabatan/jabatan/${jabatanCode}`)
            .pipe(
                map((res: any) =>
                    Array.isArray(res)
                        ? res.map((item) => new BidangJabatan(item))
                        : [],
                ),
            )
            .subscribe((list) => {
                this.bidangJabatanListSubject.next(list)
            })
    }

    deleteClass(ukom: any) {
        this.confirmationService.open(false).subscribe({
            next: (result: any) => {
                if (result) {
                    if (!result.confirmed) return

                    this.apiService
                        .deleteData(`/api/v1/room_ukom/${ukom.id}`)
                        .subscribe({
                            next: () => {
                                this.handlerService.handleAlert(
                                    'Success',
                                    'Data berhasil dihapus',
                                )

                                this.refreshPagableData()
                            },
                            error: (err: any) => {
                                if (err.error.code == 'UKM-00001') {
                                    this.handlerService.handleAlert(
                                        'Error',
                                        'Gagal menghapus kelas. Kelas masih aktif atau sedang digunakan',
                                    )
                                    return
                                }

                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menghapus data',
                                )
                            },
                        })
                }
            },
        })
    }

    handleFormInit() {
        this.editRoomUkomForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            jabatan_code: new FormControl('', Validators.required),
            jenjang_code: new FormControl('', Validators.required),
            bidang_jabatan_code: new FormControl(''),
            participant_quota: new FormControl('', Validators.required),
            vid_call_link: new FormControl('', Validators.required),
            exam_start_at: new FormControl('', Validators.required),
            exam_end_at: new FormControl('', Validators.required),
        })
    }

    refreshPagableData() {
        const currentPagable = this.pagable$.value

        const updatedPagable = {
            ...currentPagable,
            limit: 10,
        }
        this.pagable$.next(updatedPagable)
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Daftar Kelas',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.handleTabChange(0),
            })
            .addTab({
                label: 'Tambah Kelas',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1),
            })
    }

    setDefaultFormValues(data: any) {
        this.editRoomUkomForm.patchValue({
            id: data.id || '',
            name: data.name || '',
            jabatan_code: data.jabatanCode || '',
            jenjang_code: data.jenjangCode || '',
            bidang_jabatan_code: data.bidangJabatanCode || undefined,
            participant_quota: data.participantQuota || '',
            vid_call_link: data.vidCallLink || '',
            exam_start_at: data.examStartAt || '',
            exam_end_at: data.examEndAt || '',
        })
    }

    getListJenjang() {
        this.apiService.getData(`/api/v1/jenjang`).subscribe({
            next: (response: any) => {
                const jenjangs = response.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang),
                )

                jenjangs.forEach((jenjang: any) => {
                    this.jenjangMap[jenjang.code] = jenjang.name
                })

                this.fixedJenjangList$ = new BehaviorSubject(
                    jenjangs,
                ).asObservable()
            },
            error: (err) => {
                console.error('Error fetching jenjang data:', err)
            },
        })
    }

    getBidangJabatan() {
        this.apiService.getData(`/api/v1/bidang_jabatan`).subscribe({
            next: (response: any) => {
                const bidangJabatans = response.map(
                    (bidangJabatan: { [key: string]: any }) =>
                        new BidangJabatan(bidangJabatan),
                )

                bidangJabatans.forEach((bidangJabatan: any) => {
                    this.bidangJabatanMap[bidangJabatan.code] =
                        bidangJabatan.name
                })
            },
            error: (err) => {
                console.error('Error fetching jenjang data:', err)
            },
        })
    }

    getJenjang() {
        this.apiService.getData(`/api/v1/jenjang/`).subscribe({
            next: (response: any) => {
                const jenjangs = response.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang),
                )

                jenjangs.forEach((jenjang: any) => {
                    this.jenjangMap[jenjang.code] = jenjang.name
                })

                this.jenjangList$ = new BehaviorSubject(jenjangs).asObservable()
            },
            error: (err) => {
                console.error('Error fetching jenjang data:', err)
            },
        })
    }

    getJabatan() {
        this.apiService.getData(`/api/v1/jabatan`).subscribe({
            next: (response: any) => {
                const jabatans = response.map(
                    (jabatan: { [key: string]: any }) => new Jabatan(jabatan),
                )

                jabatans.forEach((jabatan: any) => {
                    this.jabatanMap[jabatan.code] = jabatan.name
                })

                this.jabatanList$ = new BehaviorSubject(jabatans).asObservable()
            },
            error: (err) => {
                console.error('Error fetching jabatan data:', err)
            },
        })
    }

    handleRefreshToggle() {
        this.refreshToggle = !this.refreshToggle
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    handleTabChange(tab?: number) {
        this.tab.set(tab)
        this.tabService.changeTabActive(tab)
    }

    // Timeline modal methods
    openTimelineModal(): void {
        // Reset state
        this.hasLoadedSchedules.set(false)
        this.timelineSchedules.set([])
        this.isTimelineModalOpen.set(true)

        // Reset date range to current month
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

        this.dateRangeForm.patchValue({
            startDate: this.formatDate(firstDay),
            endDate: this.formatDate(lastDay),
        })
    }

    // Load schedules from API
    loadSchedules(): void {
        if (this.dateRangeForm.invalid) {
            this.handlerService.handleAlert(
                'Warning',
                'Mohon lengkapi tanggal mulai dan tanggal akhir',
            )
            return
        }

        this.isLoadingSchedules.set(true)
        const { startDate, endDate } = this.dateRangeForm.value

        this.examScheduleService
            .getAllExamScheduleCalendar({ startDate, endDate })
            .pipe(
                tap((res) => console.log('API Response:', res)),
                map((response) =>
                    response.filter(
                        (item) =>
                            item.examSchedule.examTypeCode ===
                                ExamTypeCategory.WAWANCARA ||
                            item.examSchedule.examTypeCode ===
                                ExamTypeCategory.SEMINAR,
                    ),
                ),
                tap((res) => console.log('Filtered Schedules:', res)),
            )
            .subscribe({
                next: (response) => {
                    console.log(response)
                    const schedules = this.transformToScheduleItems(response)
                    this.timelineSchedules.set(schedules)
                    this.hasLoadedSchedules.set(true)
                    this.isLoadingSchedules.set(false)
                },
                error: (error) => {
                    console.error('Error loading schedules:', error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data jadwal',
                    )
                    this.isLoadingSchedules.set(false)
                },
            })
    }

    closeTimelineModal(): void {
        this.isTimelineModalOpen.set(false)
        this.timelineSchedules.set([])
        this.hasLoadedSchedules.set(false)
    }

    submit() {
        const payload = {
            id: this.editRoomUkomForm.value.id,
            name: this.editRoomUkomForm.value.name,
            jabatan_code: this.editRoomUkomForm.value.jabatan_code,
            jenjang_code: this.editRoomUkomForm.value.jenjang_code,
            bidang_jabatan_code:
                this.editRoomUkomForm.value.bidang_jabatan_code || undefined,
            participant_quota: this.editRoomUkomForm.value.participant_quota,
            vid_call_link: this.editRoomUkomForm.value.vid_call_link,
            exam_start_at: this.editRoomUkomForm.value.exam_start_at,
            exam_end_at: this.editRoomUkomForm.value.exam_end_at,
        }

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                this.submitLoading$.next(true)

                this.apiService
                    .putData('/api/v1/room_ukom', payload)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengubah data',
                            )
                            this.handleRefreshToggle()
                            this.toggleModal()
                            this.submitLoading$.next(false)
                        },
                        error: (error) => {
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengubah data',
                            )
                            this.submitLoading$.next(false)
                        },
                    })
            },
        })
    }

    // Transform API response to ScheduleItem format
    private transformToScheduleItems(
        data: ExamScheduleCalendar[],
    ): ScheduleItem[] {
        return data.map((item) => {
            const duration =
                item.personalScheduleEnd && item.personalSchedule
                    ? this.calculateDuration(
                          item.personalSchedule,
                          item.personalScheduleEnd,
                      )
                    : 1 // default 1 hour

            return {
                participantScheduleId: item.id,
                examScheduleId: item.examScheduleId,
                personalSchedule: item.personalSchedule,
                duration: duration,
                participantId: item.participantId,
                name: item.participantUkom?.name,
                email: item.participantUkom?.email,
                phone: item.participantUkom?.phone,
                nip: item.participantUkom?.nip,
                jabatanName: item.participantUkom.jabatanName,
                nextJabatanName:
                    this.jabatanMap[item.examSchedule.roomUkom.jabatanCode],
                jenjangName: item.participantUkom.jenjangName,
                nextJenjangName:
                    this.jenjangMap[item.examSchedule.roomUkom.jenjangCode],
                unitKerjaName: item.participantUkom?.unitKerjaName,
                jenisUkom: this.jenisUkomService.getLabelByValue(
                    item.participantUkom.jenisUkom,
                ),
                jenisUjian: this.ukomMiscellaneousService.getModuleDisplayName(
                    item.examSchedule?.examTypeCode,
                ),
            } as ScheduleItem
        })
    }

    // Calculate duration in hours between two datetime strings
    private calculateDuration(start: string, end: string): number {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffMs = endDate.getTime() - startDate.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        return Math.max(diffHours, 0.25) // minimum 15 minutes (0.25 hours)
    }

    // Format date to YYYY-MM-DD
    private formatDate(date: Date): string {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
}
