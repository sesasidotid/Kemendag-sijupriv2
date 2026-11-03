import { LoginContext } from '@/modules/base/commons/login-context'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { ApiService } from '@/modules/base/services/api.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ParticipantResignation } from '@/modules/ukom/models/resignation/resignation.model'
import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, finalize } from 'rxjs'

@Component({
    selector: 'app-ukom-resignation-approved-list',
    standalone: true,
    imports: [PagableComponent, CommonModule],
    templateUrl: './ukom-resignation-approved-list.component.html',
    styleUrl: './ukom-resignation-approved-list.component.scss',
})
export class UkomResignationApprovedListComponent {
    isSuperAdmin: boolean = LoginContext.getRoleCodes().includes('ADMIN')
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    refresh: boolean

    constructor(
        private router: Router,
        private confirmationService: ConfirmationService,
        private apiService: ApiService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable() {
        this.pagable$.next(
            new PagableBuilder('/api/v1/ukom_resignation/search') // ganti kalau endpoint approved beda
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('NIP', 'nip').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'name').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Jenis Ukom', (data: any) => {
                            switch (data.jenisUkom) {
                                case 'KENAIKAN_JENJANG':
                                    return 'Kenaikan Jenjang'
                                case 'PERPINDAHAN_JABATAN':
                                    return 'Perpindahan Jabatan'
                                case 'PROMOSI':
                                    return 'Promosi'
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
                        .setAction(
                            (ukomResignation: ParticipantResignation) => {
                                this.router.navigate([
                                    `/ukom/ukom-resignation-list/${ukomResignation.id}/detail`,
                                ])
                            },
                            'info',
                        )
                        .withIcon('detail')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction(
                            (ukomResignation: ParticipantResignation) => {
                                this.handleDeleteTask(ukomResignation.id)
                            },
                            'danger',
                        )
                        .withIcon('danger')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('objectGroup')
                        .withField('NIP', 'text')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('objectName')
                        .withField('Nama', 'text')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('jenisUkom')
                        .withField('Jenis UKom', 'select')
                        .withDefaultValue('')
                        .setOptionList([
                            { label: 'Promosi', value: 'PROMOSI' },
                            {
                                label: 'Kenaikan Jenjang',
                                value: 'KENAIKAN_JENJANG',
                            },
                            {
                                label: 'Perpindahan Jabatan',
                                value: 'PERPINDAHAN_JABATAN',
                            },
                            {
                                label: 'Promosi Jabatan Fungsional',
                                value: 'PROMOSI_JF',
                            },
                        ])
                        .build(),
                )
                .withQueryParams()
                .build(),
        )
    }

    handleDeleteTask(instanceId: string) {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/ukom_resignation/${instanceId}`)
                    .subscribe({
                        next: (res) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil dihapus',
                            )
                            this.refresh = !this.refresh
                        },
                        error: (err) => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Data gagal dihapus',
                            )
                            this.refresh = !this.refresh
                        },
                    })
            },
        })
    }
}
