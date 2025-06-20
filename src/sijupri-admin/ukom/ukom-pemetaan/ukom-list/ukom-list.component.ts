import { Component } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { ApiService } from '../../../../modules/base/services/api.service'
import { UkomRejectedListComponent } from '../ukom-rejected-list/ukom-rejected-list.component'
import { TabService } from '../../../../modules/base/services/tab.service'
import { BehaviorSubject, catchError, of, tap } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { PageFilter } from '../../../../modules/base/commons/pagable/page-filter'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { UkomExportVerifikasiComponent } from '../ukom-export-verifikasi/ukom-export-verifikasi.component'
@Component({
    selector: 'app-ukom-list',
    standalone: true,
    imports: [
        PagableComponent,
        UkomRejectedListComponent,
        CommonModule,
        UkomExportVerifikasiComponent
    ],
    templateUrl: './ukom-list.component.html',
    styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
    pagable: Pagable
    pagable$ = new BehaviorSubject<Pagable | null>(null)

    jabatanList: Jabatan[] = []
    refresh: boolean = false
    tab$ = new BehaviorSubject<number | null>(0)

    constructor (
        private router: Router,
        private apiService: ApiService,
        private tabService: TabService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService
    ) {}

    ngOnInit () {
        this.handleTabService()
        this.getJabatanList()
        this.handlePagable()
    }

    handleTabService () {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Rekapitulasi Lolos Verifikasi',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => this.handleTabChange(0)
            })
            .addTab({
                label: 'Export Rekapitulasi Verifikasi',
                icon: 'mdi-export',
                onClick: () => this.handleTabChange(1)
            })
    }

    handleTabChange (tab: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    handlePagable () {
        const pagable = new PagableBuilder('/api/v1/participant_ukom/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jabatan Yang Dituju', (data: any) => {
                        return (
                            this.jabatanList.find(
                                jabatan => jabatan.code === data.nextJabatanCode
                            )?.name || '-'
                        )
                    })
                    .build()
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
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Status', (data: any) =>
                        data.ukomBan != null ? 'Banned' : 'Active'
                    )
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.router.navigate([`/ukom/ukom-list/${ukom.nip}`])
                    }, 'info')
                    .withIcon('detail')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: any) => {
                        this.handleDeleteTask(ukom.nip)
                    }, 'danger')
                    .withIcon('danger')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('nip')
                    .withField('NIP', 'text')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name')
                    .withField('Nama', 'text')
                    .build()
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
                            value: 'KENAIKAN_JENJANG'
                        },
                        {
                            label: 'Perpindahan Jabatan',
                            value: 'PERPINDAHAN_JABATAN'
                        },
                        {
                            label: 'Promosi Jabatan Fungsional',
                            value: 'PROMOSI_JF'
                        }
                    ])
                    .build()
            )
            .build()

        this.pagable$.next(pagable)
    }

    handleDeleteTask (nip: string) {
        this.confirmationService.open(false).subscribe({
            next: res => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/participant_ukom/delete/${nip}`)
                    .subscribe({
                        next: res => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil dihapus'
                            )
                            this.refresh = !this.refresh
                        },
                        error: err => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Data gagal dihapus'
                            )
                            this.refresh = !this.refresh
                        }
                    })
            }
        })
    }

    updateFilterOptions () {
        let updatedPagable
        const currentPagable = this.pagable$.value

        const existingFilterList = currentPagable.filterList.map(item =>
            item.key === 'eq_nextJabatanCode'
                ? {
                      ...item,
                      optionList: this.jabatanList.map(jabatan => ({
                          label: jabatan.name,
                          value: jabatan.code
                      }))
                  }
                : item
        )

        const filterList = existingFilterList.some(
            item => item.key === 'eq_nextJabatanCode'
        )
            ? existingFilterList
            : [
                  ...existingFilterList,
                  new PageFilter({
                      label: 'Jabatan Yang Dituju',
                      fieldType: 'select',
                      key: 'eq_nextJabatanCode',
                      value: '',
                      optionList: this.jabatanList.map(jabatan => ({
                          label: jabatan.name,
                          value: jabatan.code
                      }))
                  })
              ]

        updatedPagable = {
            ...currentPagable,
            filterList
        }
        this.pagable$.next(updatedPagable)
    }

    getJabatanList () {
        this.apiService.getData('/api/v1/jabatan').subscribe({
            next: response => {
                this.jabatanList = response
            },
            error: error => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil list jabatan'
                )
                this.jabatanList = []
            },
            complete: () => {
                console.log('complete', this.jabatanList)
                this.updateFilterOptions()
            }
        })
    }
}
