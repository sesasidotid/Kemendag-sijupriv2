import { Component } from '@angular/core'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { ApiService } from '@/modules/base/services/api.service'
import { UkomRejectedListComponent } from '../ukom-rejected-list/ukom-rejected-list.component'
import { TabService } from '@/modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { UkomExportVerifikasiComponent } from '../ukom-export-verifikasi/ukom-export-verifikasi.component'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
@Component({
    selector: 'app-ukom-list',
    standalone: true,
    imports: [
        PagableComponent,
        UkomRejectedListComponent,
        CommonModule,
        UkomExportVerifikasiComponent,
    ],
    templateUrl: './ukom-list.component.html',
    styleUrl: './ukom-list.component.scss',
})
export class UkomListComponent {
    pagable: Pagable
    pagable$ = new BehaviorSubject<Pagable | null>(null)

    jabatanList: Jabatan[] = []
    refresh: boolean = false
    tab$ = new BehaviorSubject<number | null>(0)

    constructor(
        private router: Router,
        private apiService: ApiService,
        public tabService: TabService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private jenisUkomService: JenisUkomService,
        private jabatanService: JabatanService,
    ) {}

    ngOnInit() {
        this.initTabs()
        this.getJabatanList()
        this.handlePagable()
    }

    initTabs() {
        this.tabService
            .addTab({
                label: 'Rekapitulasi Lolos Verifikasi',
                icon: 'mdi-list-box',
                onClick: () => this.tabService.changeTabActive(0),
                isActive: true,
            })
            .addTab({
                label: 'Rekapitulasi Tidak Lolos Verifikasi',
                icon: 'mdi-close',
                onClick: () => this.tabService.changeTabActive(1),
            })
            .addTab({
                label: 'Export Rekapitulasi Verifikasi',
                icon: 'mdi-export',
                onClick: () => this.tabService.changeTabActive(2),
            })
    }

    handlePagable() {
        const pagable = new PagableBuilder('/api/v1/participant_ukom/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jabatan Yang Dituju', (data: any) => {
                        return (
                            this.jabatanList.find(
                                (jabatan) =>
                                    jabatan.code === data.nextJabatanCode,
                            )?.name || '-'
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: any) => {
                        return this.jenisUkomService.getLabelByValue(
                            data.jenisUkom,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Status', (data: any) =>
                        data.ukomBan != null ? 'Banned' : 'Active',
                    )
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.router.navigate([`/ukom/ukom-list/${ukom.nip}`])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.handleDeleteTask(ukom.nip)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('nip')
                    .withField('NIP', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name')
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
            .build()

        this.pagable$.next(pagable)
    }

    handleDeleteTask(nip: string) {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/participant_ukom/delete/${nip}`)
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

    updateFilterOptions() {
        let updatedPagable
        const currentPagable = this.pagable$.value

        const existingFilterList = currentPagable.filterList.map((item) =>
            item.key === 'eq_nextJabatanCode'
                ? {
                      ...item,
                      optionList: this.jabatanList.map((jabatan) => ({
                          label: jabatan.name,
                          value: jabatan.code,
                      })),
                  }
                : item,
        )

        const filterList = existingFilterList.some(
            (item) => item.key === 'eq_nextJabatanCode',
        )
            ? existingFilterList
            : [
                  ...existingFilterList,
                  new PageFilter({
                      label: 'Jabatan Yang Dituju',
                      fieldType: 'select',
                      key: 'eq_nextJabatanCode',
                      value: '',
                      optionList: this.jabatanList.map((jabatan) => ({
                          label: jabatan.name,
                          value: jabatan.code,
                      })),
                  }),
              ]

        updatedPagable = {
            ...currentPagable,
            filterList,
        }
        this.pagable$.next(updatedPagable)
    }

    getJabatanList() {
        this.jabatanService.fetchJabatan()

        this.jabatanService.jabatanList$.subscribe({
            next: (response) => {
                this.jabatanList = response
                this.updateFilterOptions()
            },
            error: () => {
                this.jabatanList = []
                this.updateFilterOptions()
            },
        })
    }
}
