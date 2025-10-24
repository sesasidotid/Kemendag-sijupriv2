import { LoginContext } from './../../../modules/base/commons/login-context'
import { Component } from '@angular/core'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../modules/base/services/api.service'
import { Observable } from 'rxjs'
import { UkomExamScheduleJF } from '../../../modules/ukom/models/ukom-exam-schedule-jf'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { TanggalWaktuIndoPipe } from '../../../modules/base/pipes/tangga-waktu.pipe'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { PesertaUkom } from '@/modules/ukom/models/peserta-ukom.model'
import { FailedTask } from '@/modules/ukom/models/ukom-registration-refactored/failed-task.model'
@Component({
    selector: 'app-ukom-list',
    standalone: true,
    imports: [PagableComponent, EmptyStateComponent, CommonModule],
    templateUrl: './ukom-list.component.html',
    styleUrl: './ukom-list.component.scss',
})
export class UkomListComponent {
    pagable: Pagable
    rejectedPagable: Pagable
    schedulePagable$: Observable<Pagable>
    id: string = LoginContext.getUserId()
    ukomSchedule: UkomExamScheduleJF

    jadwalPagable: Pagable
    TanggalWaktuIndo = new TanggalWaktuIndoPipe()

    constructor(
        private router: Router,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        public jenisUkomService: JenisUkomService,
    ) {}

    ngOnInit() {
        this.handlePagable()
        this.initRejectedPagable()
        this.getUkomSchedule()
    }

    handlePagable() {
        this.pagable = new PagableBuilder(
            `/api/v1/participant_ukom/search/${this.id}`,
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: PesertaUkom) => {
                        return this.jenisUkomService.getLabelByValue(
                            data.jenisUkom,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Tanggal', (data: PesertaUkom) => {
                        const formattedDate = this.TanggalWaktuIndo.transform(
                            data.dateCreated,
                        )

                        return formattedDate
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: PesertaUkom) => {
                        this.router.navigate([
                            `/ukom/ukom-list/detail/${ukom.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('nip')
                    .withDefaultValue(LoginContext.getUserId())
                    .build(),
            )
            .build()

        this.jadwalPagable = new PagableBuilder(
            `/api/v1/participant_ukom/nip/${this.id}`,
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jenis Ujian', 'examTypeCode').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Waktu Mulai', 'startTime').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Waktu Selesai', 'endTime').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.navigateToCATPage()
                    }, 'warning')
                    .withIcon('navigate')
                    .build(),
            )
            .build()
    }

    initRejectedPagable() {
        this.rejectedPagable = new PagableBuilder(
            '/api/v1/participant_ukom/task/failed/search',
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: FailedTask) => {
                        return this.jenisUkomService.getLabelByValue(
                            data.jenisUkom,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Tanggal', (data: FailedTask) => {
                        const formattedDate = this.TanggalWaktuIndo.transform(
                            data.dateCreated,
                        )

                        return formattedDate
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: FailedTask) => {
                        this.router.navigate([
                            `/ukom/ukom-list/failed/detail/${data.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            // .addPrimaryColumn(
            //     new PrimaryColumnBuilder('Catatan', 'comment').build(),
            // )
            .build()
    }

    getUkomSchedule() {
        this.apiService
            .getData(`/api/v1/participant_ukom/nip/${this.id}`)
            .subscribe({
                next: (res) => {
                    if (res.roomUkomDto) {
                        this.ukomSchedule = new UkomExamScheduleJF(
                            res.roomUkomDto,
                        )
                    } else {
                        this.ukomSchedule.examScheduleDtoList = []
                    }
                },
            })
    }

    navigateToCATPage() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                LoginContext.release()

                this.router.navigate(['/login-cat'])
            },
        })
    }
}
