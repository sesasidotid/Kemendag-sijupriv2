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
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
@Component({
    selector: 'app-ukom-list',
    standalone: true,
    imports: [PagableComponent, UkomRejectedListComponent, CommonModule],
    templateUrl: './ukom-list.component.html',
    styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
    pagable: Pagable

    jenisUkomMap: Record<string, string> = {}
    jabatanNameCache: { [key: string]: string } = {}; // Cache for Jabatan names
    refresh: boolean = false
    tab$ = new BehaviorSubject<number | null>(0)

    constructor(private router: Router, private apiService: ApiService, private tabService: TabService, private confirmationService: ConfirmationService, private handlerService: HandlerService) { }

    ngOnInit() {
        // this.handleTabService()
        this.handlerPagable()
        this.getJabatanList();
    }


    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Lolos Verifikasi',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => this.handleTabChange(0)
            })
            .addTab({
                label: 'Tidak Lolos Verifikasi',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1)
            })
    }

    handleTabChange(tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    handlerPagable() {
        this.pagable = new PagableBuilder('/api/v1/participant_ukom/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jabatan Yang Dituju', (data: any) => {
                        return this.jabatanNameCache[data.nextJabatanCode] || '-';
                    })
                    .build()
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
                    .setProperty('nextJabatanCode')
                    .withField('Jabatan Yang Dituju', 'select').withDefaultValue("")
                    .setOptionList([
                        {
                            label: "Analis Perdagangan",
                            value: "JB1"
                        },
                        {
                            label: "Pengawas Perdagangan",
                            value: "JB4"
                        },
                        {
                            label: "Penguji Mutu Barang",
                            value: "JB7"
                        },
                        {
                            label: "Pengamat Tera",
                            value: "JB10"
                        },
                        {
                            label: "Penera",
                            value: "JB11"
                        },
                        {
                            label: "Negosiator Perdagangan",
                            value: "JB5"
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
    }
    
    handleDeleteTask(nip: string) {
        this.confirmationService.open(false).subscribe({
            next: res => {
                if (!res.confirmed) {
                    return
                }

                this.apiService.deleteData(`/api/v1/participant_ukom/delete/${nip}`).subscribe({
                    next: res => {
                        this.handlerService.handleAlert('Success', 'Data berhasil dihapus')
                        this.refresh = !this.refresh
                    },
                    error: err => {
                        this.handlerService.handleAlert('Error', 'Data gagal dihapus')
                        this.refresh = !this.refresh
                    }
                })
            }
        })
    }

    getJabatanList() {
        this.apiService.getData('/api/v1/jabatan').subscribe({
            next: (response) => {
                response.forEach((item: any) => {
                    this.jabatanNameCache[item.code] = item.name;
                });

                console.log('q', this.jabatanNameCache)

                this.refresh = !this.refresh
            }
        });
    }
}
