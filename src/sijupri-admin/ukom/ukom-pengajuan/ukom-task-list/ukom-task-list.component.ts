import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,

} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { TabService } from '../../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { PageFilter } from '../../../../modules/base/commons/pagable/page-filter'
@Component({
    selector: 'app-ukom-task-list',
    standalone: true,
    imports: [CommonModule, PagableComponent],
    templateUrl: './ukom-task-list.component.html',
    styleUrl: './ukom-task-list.component.scss'
})
export class UkomTaskListComponent {
    pagable: Pagable
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    jabatanList$ = new BehaviorSubject<{ label: string; value: string }[]>([]);

    constructor(private router: Router, private tabService: TabService, private apiService: ApiService) { }

    ngOnInit() {
        this.getJabatanList()
        this.handleTabService()
        this.handlePagable()
    }

    handlePagable() {
        this.pagable$.next(
            new PagableBuilder('/api/v1/participant_ukom/task/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('NIP', 'objectGroup').build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'objectName').build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Proses', 'flowName').build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Jabatan Yang Dituju', 'nextJabatanName').build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Jenis UKom', (data: any) =>
                            data.jenisUkom === 'KENAIKAN_JENJANG'
                                ? 'Kenaikan Jenjang'
                                : data.jenisUkom === 'PERPINDAHAN_JABATAN'
                                    ? 'Perpindahan Jabatan'
                                    : data.jenisUkom === 'PROMOSI'
                                        ? 'Promosi'
                                        : data.jenisUkom
                        )
                        .build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Tanggal Terakhir Update', 'lastUpdated').build()
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Status', 'taskStatus').build()
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((pendingTask: any) => {
                            this.router.navigate([`/ukom/ukom-task-list/${pendingTask.id}`])
                        }, 'info')
                        .withIcon('detail')
                        .build()
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('flowId')
                        .withDefaultValue('ukom_flow_1')
                        .build()
                )

                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('objectGroup')
                        .withField('NIP', 'text')
                        .build()
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('objectName')
                        .withField('Nama', 'text')
                        .build()
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('nextJabatanName')
                        .withField('Jabatan Yang Dituju', 'select').withDefaultValue("")
                        .setOptionList([
                            {
                                label: "Analis Perdagangan",
                                value: "Analis Perdagangan"
                            },
                            {
                                label: "Pengawas Perdagangan",
                                value: "Pengawas Perdagangan"
                            },
                            {
                                label: "Penguji Mutu Barang",
                                value: "Penguji Mutu Barang"
                            },
                            {
                                label: "Pengamat Tera",
                                value: "Pengamat Tera"
                            },
                            {
                                label: "Penera",
                                value: "Penera"
                            },
                            {
                                label: "Negosiator Perdagangan",
                                value: "Negosiator Perdagangan"
                            }
                        ])
                        .build()
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('jenisUkom')
                        .withField('Jenis UKom', 'select').withDefaultValue("")
                        .setOptionList([
                            { label: 'Promosi', value: 'PROMOSI' },
                            { label: 'Kenaikan Jenjang', value: 'KENAIKAN_JENJANG' },
                            { label: 'Perpindahan Jabatan', value: 'PERPINDAHAN_JABATAN' }
                        ])
                        .build()
                )
                .build()
        )
    }

    getJabatanList() {
        this.apiService.getData('/api/v1/jabatan').subscribe({
            next: (response) => {
                const mappedData = response.map((item: any) => ({
                    label: item.name,
                    value: item.code
                }));
                this.jabatanList$.next(mappedData);
            }
        });

        this.jabatanList$.subscribe(value => {
            console.log(value);
        })
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Verifikasi Pengajuan',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => this.handlePagableTabChange('ukom_flow_1', 0)
            })
            .addTab({
                label: 'Perbaikan Dokumen',
                icon: 'mdi-account-supervisor',
                onClick: () => this.handlePagableTabChange('ukom_flow_2', 1)
            })
            .addTab({
                label: 'Tidak Lolos Verifikasi',
                icon: 'mdi-account-supervisor',
                onClick: () => this.handlePagableTabChange('rejected', 2)
            })
    }

    // handlePagableTabChange(tab: string, tabIndex: number) {
    //     const currentPagable = this.pagable$.value

    //     const updatedPagable = {
    //         ...currentPagable,
    //         filterLIst: currentPagable.filterLIst.map((item, index) =>
    //             item.key === 'eq_flowId' ? { ...item, value: tab } : item
    //         )
    //     }

    //     this.tabService.changeTabActive(tabIndex)
    //     this.pagable$.next(updatedPagable)
    // }
    handlePagableTabChange(tab: string, tabIndex: number) {
        const currentPagable = this.pagable$.value;

        let updatedPagable;

        if (tab === 'rejected') {
            // Remove 'eq_flowId' from filterList and update the endpoint
            updatedPagable = {
                ...currentPagable,
                filterList: currentPagable.filterList.filter(item => item.key !== 'eq_flowId'),
                endpoint: '/api/v1/participant_ukom/task/failed/search'
            };
        } else {
            // Ensure 'eq_flowId' exists when switching from 'rejected' to another tab
            const existingFilterList = currentPagable.filterList.map(item =>
                item.key === 'eq_flowId' ? { ...item, value: tab } : item
            );

            // If 'eq_flowId' does not exist, add a valid PageFilter
            const filterList = currentPagable.filterList.some(item => item.key === 'eq_flowId')
                ? existingFilterList
                : [
                    ...existingFilterList,
                    new PageFilter({
                        // label: 'Flow ID',
                        // fieldType: 'text',
                        key: 'eq_flowId',
                        value: tab,
                        // optionList: []
                    })
                ];

            updatedPagable = {
                ...currentPagable,
                filterList,
                endpoint: '/api/v1/participant_ukom/task/search'
            };
        }

        this.tabService.changeTabActive(tabIndex);
        this.pagable$.next(updatedPagable);
    }



}
