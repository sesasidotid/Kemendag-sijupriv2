import { Component, inject, OnInit, signal } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { CommonModule, Location } from '@angular/common'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { ActivatedRoute, Router } from '@angular/router'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import {
    BehaviorSubject,
    combineLatest,
    finalize,
    map,
    Observable,
    take,
} from 'rxjs'
import { TabService } from '@/modules/base/services/tab.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { RoomParticipant } from '@/modules/ukom/models/room/room-participant.model'
import { AddExaminerModalComponent } from './add-examiner-modal/add-examiner-modal.component'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { RoomExmainer } from '@/modules/ukom/models/room/room-examiner.model'

@Component({
    selector: 'app-ukom-class-detail',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        TanggalIndoPipe,
        AddExaminerModalComponent,
    ],
    templateUrl: './ukom-class-detail.component.html',
    styleUrl: './ukom-class-detail.component.scss',
})
export class UkomClassDetailComponent implements OnInit {
    id: string
    detailKelas: RoomUkomDetail = new RoomUkomDetail()

    isAddExaminerModalOpen = signal(false)
    examinerListRefresh = signal(false)

    pagable: Pagable
    examinerListPagable: Pagable

    isDetailKelasLoading$ = new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>

    jenisUkomService = inject(JenisUkomService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private tabService: TabService,
        private location: Location,
    ) {
        this.isLoading$ = combineLatest([this.isDetailKelasLoading$]).pipe(
            map((loadings) => loadings.some((isLoading) => isLoading)),
        )
    }

    ngOnInit() {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe((params) => {
            this.id = params.get('id')

            this.handlePagable()
            this.initExaminerListPagable()
            this.getDetailKelas()
        })
        this.handleTabService()
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }

    handlePagable() {
        this.pagable = new PagableBuilder(
            `/api/v1/participant_ukom/room/${this.id}`,
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Nama',
                    'participantUkom|name',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('NIP', 'participantUkom|nip').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Email',
                    'participantUkom|email',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: RoomParticipant) => {
                        return this.jenisUkomService.getLabelByValue(
                            data.participantUkom?.jenisUkom,
                        )
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: RoomParticipant) => {
                        this.router.navigate([
                            `/ukom/ukom-room-list/detail-participant/${data.participantUkom?.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .build()
    }

    initExaminerListPagable() {
        this.examinerListPagable = new PagableBuilder(
            `/api/v1/examiner_ukom/room/${this.id}`,
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Nama',
                    'examinerUkom|user|name',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Username',
                    'examinerUkom|nip',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis UKom', (data: RoomExmainer) => {
                        const jenisUkomList = data.examinerUkom.examinerTypeList
                            .flat() // flatten one level
                            .map((item) =>
                                this.ukomMiscellaneousService.getModuleDisplayName(
                                    item.examType,
                                ),
                            )
                            .filter(Boolean)
                            .join(', ')

                        return jenisUkomList || '-'
                    })

                    .build(),
            )
            .build()
    }

    handleTabService() {
        this.tabService
            .addTab({
                label: 'Detail Kelas',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => {},
            })
            .addTab({
                label: 'Tambah Jadwal UKom',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(),
            })
    }

    handleTabChange() {
        this.router.navigate([`add-ukom-schedule`], {
            relativeTo: this.activatedRoute,
            replaceUrl: true,
        })
    }

    getDetailKelas() {
        this.isDetailKelasLoading$.next(true)
        this.apiService
            .getData(`/api/v1/room_ukom/${this.id}`)
            .pipe(
                finalize(() => {
                    this.isDetailKelasLoading$.next(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.detailKelas = res
                },
                error: () => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil detail kelas UKOM',
                    )
                },
            })
    }

    openAddExaminerModal() {
        this.isAddExaminerModalOpen.set(true)
    }

    toggleAddExaminerModal() {
        this.isAddExaminerModalOpen.set(!this.isAddExaminerModalOpen())
    }

    handleExaminerAdded() {
        this.examinerListRefresh.set(!this.examinerListRefresh())
        this.toggleAddExaminerModal()
    }
}
