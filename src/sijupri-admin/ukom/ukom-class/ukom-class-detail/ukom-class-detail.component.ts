import { Component } from '@angular/core'
import { ApiService } from '@/modules/base/services/api.service'
import { CommonModule, Location } from '@angular/common'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { ActivatedRoute } from '@angular/router'
import { RoomUkomDetail } from '@/modules/ukom/models/room-ukom-detail'
import { combineLatest, finalize, Observable } from 'rxjs'
import { map, take, BehaviorSubject } from 'rxjs'
import { Router } from '@angular/router'
import { TabService } from '@/modules/base/services/tab.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
@Component({
    selector: 'app-ukom-class-detail',
    standalone: true,
    imports: [PagableComponent, CommonModule, TanggalIndoPipe],
    templateUrl: './ukom-class-detail.component.html',
    styleUrl: './ukom-class-detail.component.scss',
})
export class UkomClassDetailComponent {
    id: string
    detailKelas: RoomUkomDetail = new RoomUkomDetail()

    pagable: Pagable
    tab$ = new BehaviorSubject<number | null>(0)

    isDetailKelasLoading$ = new BehaviorSubject<boolean>(false)
    isLoading$: Observable<boolean>

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
            this.getDetailKelas()
        })
        this.handleTabService()
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back()
        } else {
            // this.router.navigate(['/'])
            this.router.navigate(['../', { relativeTo: this.activatedRoute }])
        }
    }

    handlePagable() {
        this.pagable = new PagableBuilder(
            `/api/v1/participant_ukom/room/${this.id}`,
        )
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Email', 'email').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: any) => {
                        switch (data.jenisUkom) {
                            case 'KENAIKAN_JENJANG':
                                return 'Kenaikan Jenjang'
                            case 'PERPINDAHAN_JABATAN':
                                return 'Perpindahan Jabatan'
                            case 'PROMOSI_JF':
                                return 'Promosi Jabatan Fungsional'
                            default:
                                return data.jenisUkom
                        }
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: any) => {
                        this.router.navigate([
                            `/ukom/ukom-room-list/detail-participant/${data.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
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
                error: (err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengambil detail kelas UKOM',
                    )
                },
            })
    }
}
