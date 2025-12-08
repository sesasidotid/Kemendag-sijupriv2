import { CommonModule } from '@angular/common'
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
import { TabService } from '@/modules/base/services/tab.service'
import { BehaviorSubject, finalize } from 'rxjs'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { ApiService } from '@/modules/base/services/api.service'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { UkomTaskService } from '@/modules/ukom/services/ukom-task.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { UkomFlowId } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
@Component({
    selector: 'app-ukom-task-list',
    standalone: true,
    imports: [CommonModule, PagableComponent, LoadingButtonComponent],
    templateUrl: './ukom-task-list.component.html',
    styleUrl: './ukom-task-list.component.scss',
})
export class UkomTaskListComponent {
    public flowId = UkomFlowId

    pagable$ = new BehaviorSubject<Pagable | null>(null)
    jabatanList: Jabatan[] = []
    refresh: boolean
    tabIndex = new BehaviorSubject<number>(0)
    currentFlow = new BehaviorSubject<string>(this.flowId.UkomFlowId1)

    finalizeLoading: boolean = false
    constructor(
        private router: Router,
        private tabService: TabService,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        public jenjangService: JenjangService,
        private ukomTaskService: UkomTaskService,
    ) {}

    ngOnInit() {
        this.getJabatanList()
        this.jenjangService.fetchJenjang()
        this.handlePagable()
        this.handleTabService()
    }

    handleDeleteTask(instanceId: string) {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/pending_task/delete/${instanceId}`)
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

    handlePagable() {
        this.pagable$.next(
            new PagableBuilder('/api/v1/participant_ukom/task/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('NIP', 'objectGroup').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'objectName').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Proses', 'flowName').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Jabatan Yang Dituju',
                        'nextJabatanName',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Jenjang Yang Dituju',
                        'nextJenjangName',
                    ).build(),
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
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Tanggal Terakhir Update',
                        'lastUpdated',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Status', 'taskStatus').build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((pendingTask: any) => {
                            this.router.navigate([
                                `/ukom/ukom-task-list/${pendingTask.id}`,
                            ])
                        }, 'info')
                        .withIcon('detail')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((pendingTask: any) => {
                            this.handleDeleteTask(pendingTask.instanceId)
                        }, 'danger')
                        .withIcon('danger')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('flowId')
                        .withDefaultValue('ukom_flow_1')
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

    updateFilterOptions() {
        const currentPagable = this.pagable$.value
        let filterList = currentPagable.filterList

        // Ensure jabatan filter
        filterList = this.ensureFilter(
            filterList,
            'like_nextJabatanName',
            'Jabatan Yang Dituju',
            this.jabatanList,
        )

        this.jenjangService.jenjangList$.subscribe((jenjangs) => {
            const finalFilterList = this.ensureFilter(
                filterList,
                'like_nextJenjangName',
                'Jenjang Yang Dituju',
                jenjangs,
            )

            this.pagable$.next({
                ...currentPagable,
                filterList: finalFilterList,
            })
        })
    }

    private ensureFilter(
        filterList: PageFilter[],
        key: string,
        label: string,
        sourceList: { name: string }[],
    ): PageFilter[] {
        const updated = filterList.map((item) =>
            item.key === key
                ? {
                      ...item,
                      optionList: sourceList.map((i) => ({
                          label: i.name,
                          value: i.name,
                      })),
                  }
                : item,
        )

        return updated.some((item) => item.key === key)
            ? updated
            : [
                  ...updated,
                  new PageFilter({
                      label,
                      fieldType: 'select',
                      key,
                      value: '',
                      optionList: sourceList.map((i) => ({
                          label: i.name,
                          value: i.name,
                      })),
                  }),
              ]
    }

    getJabatanList() {
        this.apiService.getData('/api/v1/jabatan').subscribe({
            next: (response) => {
                this.jabatanList = response
            },
            error: (error) => {
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil list jabatan',
                )
                this.jabatanList = []
            },
            complete: () => {
                console.log('complete', this.jabatanList)
                this.updateFilterOptions()
            },
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
                // isActive: true,
                isActive: this.tabIndex.value == 0,
                onClick: () => this.handlePagableTabChange('ukom_flow_1', 0),
            })
            .addTab({
                label: 'Perbaikan Dokumen',
                icon: 'mdi-account-supervisor',
                isActive: this.tabIndex.value == 1,
                onClick: () => this.handlePagableTabChange('ukom_flow_2', 1),
            })
            // .addTab({
            //     label: 'Tidak Lolos Verifikasi',
            //     icon: 'mdi-close',
            //     isActive: this.tabIndex.value == 2,
            //     onClick: () => this.handlePagableTabChange('rejected', 2),
            // })
            .addTab({
                label: 'Tidak Lolos Verifikasi',
                icon: 'mdi-close',
                isActive: this.tabIndex.value == 3,
                onClick: () => this.handlePagableTabChange('ukom_flow_3', 2),
            })
            .addTab({
                label: 'Lolos Verifikasi',
                icon: 'mdi-check',
                isActive: this.tabIndex.value == 4,
                onClick: () => this.handlePagableTabChange('ukom_flow_4', 3),
            })
    }

    handlePagableTabChange(tab: string, tabIndex: number) {
        const currentPagable = this.pagable$.value

        let updatedPagable

        if (tab === 'rejected') {
            updatedPagable = {
                ...currentPagable,
                filterList: currentPagable.filterList.filter(
                    (item) => item.key !== 'eq_flowId',
                ),
                endpoint: '/api/v1/participant_ukom/task/failed/search',
            }
        } else {
            const existingFilterList = currentPagable.filterList.map((item) =>
                item.key === 'eq_flowId' ? { ...item, value: tab } : item,
            )

            const filterList = currentPagable.filterList.some(
                (item) => item.key === 'eq_flowId',
            )
                ? existingFilterList
                : [
                      ...existingFilterList,
                      new PageFilter({
                          key: 'eq_flowId',
                          value: tab,
                      }),
                  ]

            updatedPagable = {
                ...currentPagable,
                filterList,
                endpoint: '/api/v1/participant_ukom/task/search',
            }
        }

        this.tabService.changeTabActive(tabIndex)
        this.pagable$.next(updatedPagable)
        this.currentFlow.next(tab)
    }

    finalizePendingTask() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.finalizeLoading = true
                this.ukomTaskService
                    .finishPendingTask()
                    .pipe(finalize(() => (this.finalizeLoading = false)))
                    .subscribe({
                        next: () => {
                            this.refresh = !this.refresh
                        },
                    })
            },
        })
    }
}
