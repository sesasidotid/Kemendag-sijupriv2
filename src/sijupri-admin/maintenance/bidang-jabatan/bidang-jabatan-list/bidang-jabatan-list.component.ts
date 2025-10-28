import { ConfirmationService } from './../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { BehaviorSubject } from 'rxjs'
import { TabService } from '../../../../modules/base/services/tab.service'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { ApiService } from '../../../../modules/base/services/api.service'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { BidangJabatanEditComponent } from '../bidang-jabatan-edit/bidang-jabatan-edit.component'
import { BidangJabatan } from '../../../../modules/maintenance/models/bidang-jabatan.model'
import { BidangJabatanAddComponent } from '../bidang-jabatan-add/bidang-jabatan-add.component'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
    selector: 'app-bidang-jabatan-list',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        ModalComponent,
        BidangJabatanEditComponent,
        BidangJabatanAddComponent,
    ],
    templateUrl: './bidang-jabatan-list.component.html',
    styleUrl: './bidang-jabatan-list.component.scss',
})
export class BidangJabatanListComponent {
    pagable: Pagable
    tab$ = new BehaviorSubject<number | null>(0)
    refresh: boolean = false
    jabatanNameCache: { [key: string]: string } = {}
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    updateBidangJabatanData = new BidangJabatan()

    constructor(
        private router: Router,
        private tabService: TabService,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.getJabatanList()
        this.handlePagable()
        this.handlerTabService()
    }

    handlerTabService() {
        this.tabService
            .addTab({
                label: 'Daftar Bidang Jabatan',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.handleTabChange(0),
            })
            .addTab({
                label: 'Tambah Bidang Jabatan',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1),
            })
    }

    handleTabChange(tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    handleDeleteBidangJabatanByCode(code: string) {
        this.confirmationService.open(false).subscribe({
            next: (res) => {
                if (!res.confirmed) {
                    return
                }

                this.apiService
                    .deleteData(`/api/v1/bidang_jabatan/${code}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus data bidang jabatan',
                            )
                            this.refresh = !this.refresh
                        },
                        error: (error) => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus data bidang jabatan',
                            )
                        },
                    })
            },
        })
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/bidang_jabatan')
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jabatan', (data: any) => {
                        return this.jabatanNameCache[data.jabatanCode] || '-'
                    })
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name')
                    .withField('Nama Bidang Jabatan', 'text')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: any) => {
                        this.toggleModal()
                        this.updateBidangJabatanData = data
                    }, 'primary')
                    .withIcon('update')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: any) => {
                        this.handleDeleteBidangJabatanByCode(data.code)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    toggleRefresh() {
        this.isModalOpen$.next(false)
        this.refresh = !this.refresh
    }

    getJabatanList() {
        this.apiService.getData('/api/v1/jabatan').subscribe({
            next: (response) => {
                response.forEach((item: any) => {
                    this.jabatanNameCache[item.code] = item.name
                })
                this.refresh = !this.refresh
            },
        })
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }
}
