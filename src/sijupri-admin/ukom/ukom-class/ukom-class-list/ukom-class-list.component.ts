import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { TabService } from '../../../../modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import {
    BehaviorSubject,
    distinctUntilChanged,
    map,
    of,
    startWith,
    tap
} from 'rxjs'
import { UkomClassAddComponent } from '../ukom-class-add/ukom-class-add.component'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Observable } from 'rxjs'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { BidangJabatan } from '../../../../modules/maintenance/models/bidang-jabatan.model'
import { RoomUkom } from '../../../../modules/ukom/models/room-ukom.model'
import { TanggalWaktuIndoPipe } from '../../../../modules/base/pipes/tangga-waktu.pipe'
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
        TanggalWaktuIndoPipe
    ],
    templateUrl: './ukom-class-list.component.html',
    styleUrl: './ukom-class-list.component.scss'
})
export class UkomClassListComponent {
    tab$ = new BehaviorSubject<number | null>(0)
    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>
    fixedJenjangList$: Observable<Jenjang[]>
    jenjangMap: Record<string, string> = {}
    jabatanMap: Record<string, string> = {}
    bidangJabatanMap: Record<string, string> = {}
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    data: any[] = []
    refreshToggle: boolean = false
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    editRoomUkomForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)
    private bidangJabatanListSubject = new BehaviorSubject<BidangJabatan[]>([])
    bidangJabatanList$ = this.bidangJabatanListSubject.asObservable()
    tanggalWaktuPipe = new TanggalWaktuIndoPipe()

    constructor (
        private tabService: TabService,
        private router: Router,
        private handlerService: HandlerService,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService
    ) {}

    ngOnInit () {
        this.handleTabService()
        this.handlePagable()
        this.handleFormInit()
        this.getJenjang()
        this.getJabatan()
        this.getBidangJabatan()

        this.handleSubscribe()
        this.handleBidangJabatanValidation()
    }

    handleBidangJabatanValidation () {
        this.bidangJabatanList$.subscribe(bidangJabatanList => {
            const control = this.editRoomUkomForm.get('bidang_jabatan_code')
            if (!control) return

            const currentValidators = control.validator
                ? [control.validator]
                : []
            const isRequiredAlreadySet = currentValidators.some(
                v => v === Validators.required
            )

            if (bidangJabatanList.length > 0 && !isRequiredAlreadySet) {
                control.setValidators([Validators.required])
            } else if (bidangJabatanList.length === 0) {
                control.clearValidators()
            }

            control.updateValueAndValidity({ emitEvent: false })
        })
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.editRoomUkomForm.get(controlName),
            controlName,
            label
        )
    }

    handlePagable () {
        this.pagable$.next(
            new PagableBuilder('/api/v1/room_ukom/search')

                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'name').build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Kuota Peserta',
                        'participantQuota'
                    ).build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Mulai', (data: RoomUkom) => {
                            const formattedDate =
                                this.tanggalWaktuPipe.transform(
                                    data.examStartAt
                                )

                            return formattedDate
                        })
                        .build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Selesai', (data: RoomUkom) => {
                            const formattedDate =
                                this.tanggalWaktuPipe.transform(data.examEndAt)

                            return formattedDate
                        })
                        .build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Jabatan',
                            (data: any) => this.jabatanMap[data.jabatanCode]
                        )
                        .build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Jenjang',
                            (data: any) =>
                                this.jenjangMap[data.jenjangCode] || ''
                        )
                        .build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Bidang Jabatan',
                            (data: any) =>
                                this.bidangJabatanMap[data.bidangJabatanCode] ||
                                ''
                        )
                        .build()
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((ukom: any) => {
                            this.router.navigate([
                                `ukom/ukom-room-list/${ukom.id}`
                            ])
                        }, 'info')
                        .withIcon('detail')
                        .build()
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((data: any) => {
                            this.setDefaultFormValues(data)
                            this.toggleModal()
                            this.getListJenjang()
                        }, 'primary')
                        .withIcon('update')
                        .build()
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction(
                            (ukom: any) => this.deleteClass(ukom),
                            'danger'
                        )
                        .withIcon('danger')
                        .build()
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('name')
                        .withField('Nama', 'text')
                        .build()
                )
                .build()
        )
    }

    handleSubscribe () {
        this.editRoomUkomForm
            .get('jabatan_code')
            ?.valueChanges.pipe(distinctUntilChanged())
            .subscribe(jabatanCode => {
                const bidangJabatanControl = this.editRoomUkomForm.get(
                    'bidang_jabatan_code'
                )
                bidangJabatanControl?.reset()

                if (jabatanCode) {
                    this.getBidangJabatanByJabatanCode(jabatanCode)
                }
            })
    }

    getBidangJabatanByJabatanCode (jabatanCode: string): void {
        this.apiService
            .getData(`/api/v1/bidang_jabatan/jabatan/${jabatanCode}`)
            .pipe(
                map((res: any) =>
                    Array.isArray(res)
                        ? res.map(item => new BidangJabatan(item))
                        : []
                )
            )
            .subscribe(list => {
                this.bidangJabatanListSubject.next(list)
            })
    }

    deleteClass (ukom: any) {
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
                                    'Data berhasil dihapus'
                                )

                                this.refreshPagableData()
                            },
                            error: (err: any) => {
                                if (err.error.code == 'UKM-00001') {
                                    this.handlerService.handleAlert(
                                        'Error',
                                        'Gagal menghapus kelas. Kelas memiliki jadwal ujian'
                                    )
                                    return
                                }

                                this.handlerService.handleAlert(
                                    'Error',
                                    'Gagal menghapus data'
                                )
                            }
                        })
                }
            }
        })
    }

    handleFormInit () {
        this.editRoomUkomForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            jabatan_code: new FormControl('', Validators.required),
            jenjang_code: new FormControl('', Validators.required),
            bidang_jabatan_code: new FormControl(''),
            participant_quota: new FormControl('', Validators.required),
            vid_call_link: new FormControl('', Validators.required),
            exam_start_at: new FormControl('', Validators.required),
            exam_end_at: new FormControl('', Validators.required)
        })
    }

    refreshPagableData () {
        const currentPagable = this.pagable$.value

        const updatedPagable = {
            ...currentPagable,
            limit: 10
        }
        this.pagable$.next(updatedPagable)
    }

    handleTabService () {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Daftar Kelas',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.handleTabChange(0)
            })
            .addTab({
                label: 'Tambah Kelas',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1)
            })
    }

    setDefaultFormValues (data: any) {
        this.editRoomUkomForm.patchValue({
            id: data.id || '',
            name: data.name || '',
            jabatan_code: data.jabatanCode || '',
            jenjang_code: data.jenjangCode || '',
            bidang_jabatan_code: data.bidangJabatanCode || undefined,
            participant_quota: data.participantQuota || '',
            vid_call_link: data.vidCallLink || '',
            exam_start_at: data.examStartAt || '',
            exam_end_at: data.examEndAt || ''
        })
    }

    getListJenjang () {
        this.apiService.getData(`/api/v1/jenjang`).subscribe({
            next: (response: any) => {
                const jenjangs = response.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
                )

                jenjangs.forEach((jenjang: any) => {
                    this.jenjangMap[jenjang.code] = jenjang.name
                })

                this.fixedJenjangList$ = new BehaviorSubject(
                    jenjangs
                ).asObservable()
            },
            error: err => {
                console.error('Error fetching jenjang data:', err)
            }
        })
    }

    getBidangJabatan () {
        this.apiService.getData(`/api/v1/bidang_jabatan`).subscribe({
            next: (response: any) => {
                const bidangJabatans = response.map(
                    (bidangJabatan: { [key: string]: any }) =>
                        new BidangJabatan(bidangJabatan)
                )

                bidangJabatans.forEach((bidangJabatan: any) => {
                    this.bidangJabatanMap[bidangJabatan.code] =
                        bidangJabatan.name
                })
            },
            error: err => {
                console.error('Error fetching jenjang data:', err)
            }
        })
    }

    getJenjang () {
        this.apiService.getData(`/api/v1/jenjang/`).subscribe({
            next: (response: any) => {
                const jenjangs = response.map(
                    (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
                )

                jenjangs.forEach((jenjang: any) => {
                    this.jenjangMap[jenjang.code] = jenjang.name
                })

                this.jenjangList$ = new BehaviorSubject(jenjangs).asObservable()
            },
            error: err => {
                console.error('Error fetching jenjang data:', err)
            }
        })
    }

    getJabatan () {
        this.apiService.getData(`/api/v1/jabatan`).subscribe({
            next: (response: any) => {
                const jabatans = response.map(
                    (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
                )

                jabatans.forEach((jabatan: any) => {
                    this.jabatanMap[jabatan.code] = jabatan.name
                })

                this.jabatanList$ = new BehaviorSubject(jabatans).asObservable()
            },
            error: err => {
                console.error('Error fetching jabatan data:', err)
            }
        })
    }

    handleRefreshToggle () {
        this.refreshToggle = !this.refreshToggle
    }

    toggleModal () {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    handleTabChange (tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    submit () {
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
            exam_end_at: this.editRoomUkomForm.value.exam_end_at
        }

        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return
                this.submitLoading$.next(true)

                this.apiService
                    .putData('/api/v1/room_ukom', payload)
                    .subscribe({
                        next: response => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengubah data'
                            )
                            this.handleRefreshToggle()
                            this.toggleModal()
                            this.submitLoading$.next(false)
                        },
                        error: error => {
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengubah data'
                            )
                            this.submitLoading$.next(false)
                        }
                    })
            }
        })
    }
}
