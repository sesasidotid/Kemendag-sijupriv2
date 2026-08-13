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
import { TabService } from '@/modules/base/services/tab.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { UkomResignationFlowId } from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'
import { UkomTaskService } from '@/modules/ukom/services/ukom-task.service'
import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, finalize } from 'rxjs'
import { UkomResignationApprovedListComponent } from '../ukom-resignation-approved-list/ukom-resignation-approved-list.component'

@Component({
    selector: 'app-ukom-resignation-list',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        UkomResignationApprovedListComponent,
    ],
    templateUrl: './ukom-resignation-list.component.html',
    styleUrl: './ukom-resignation-list.component.scss',
})
export class UkomResignationListComponent {
    public flowId = UkomResignationFlowId
    isSuperAdmin: boolean = LoginContext.getRoleCodes().includes('ADMIN')
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    jabatanList: Jabatan[] = []
    refresh: boolean
    tabIndex = new BehaviorSubject<number>(0)
    currentFlow = new BehaviorSubject<string>(
        this.flowId.UkomResignationFlowId1,
    )
    tabService = inject(TabService)

    finalizeLoading: boolean = false
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private ukomTaskService: UkomTaskService,
    ) {}

    ngOnInit() {
        this.syncTabWithUrl()
        this.handlePagable()
        this.handleTabService()
    }

    syncTabWithUrl() {
        const flowId = this.route.snapshot.queryParams['eq_flowId']
        const flowToTabIndex: { [key: string]: number } = {
            resignation_flow_1: 0,
            resignation_flow_2: 1,
        }
        if (flowId && flowToTabIndex[flowId] !== undefined) {
            this.tabIndex.next(flowToTabIndex[flowId])
            this.currentFlow.next(flowId)
        }
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
            new PagableBuilder('/api/v1/ukom_resignation/task/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('NIP', 'objectGroup').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Nama', 'objectName').build(),
                )

                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Jenis Ukom', (data: any) => {
                            console.log('data : ', data.objectTask)
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
                    new PrimaryColumnBuilder('Kelas', 'roomUkomName').build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((pendingTask: any) => {
                            this.router.navigate([
                                `/ukom/ukom-resignation/${pendingTask.id}`,
                            ])
                        }, 'info')
                        .withIcon('detail')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('flowId')
                        .withDefaultValue('resignation_flow_1')
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
                onClick: () =>
                    this.handlePagableTabChange('resignation_flow_1', 0),
            })
            .addTab({
                label: 'Perlu Perbaikan',
                icon: 'mdi-close',
                isActive: this.tabIndex.value == 1,
                onClick: () =>
                    this.handlePagableTabChange('resignation_flow_2', 1),
            })
            .addTab({
                label: 'Pengajuan Diterima',
                icon: 'mdi-check',
                isActive: this.tabIndex.value == 2,
                onClick: () => this.tabService.changeTabActive(2),
            })
    }

    handlePagableTabChange(tab: string, tabIndex: number) {
        this.tabService.changeTabActive(tabIndex)
        this.currentFlow.next(tab)

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { eq_flowId: tab, page: 1 },
            queryParamsHandling: 'merge',
        })
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
