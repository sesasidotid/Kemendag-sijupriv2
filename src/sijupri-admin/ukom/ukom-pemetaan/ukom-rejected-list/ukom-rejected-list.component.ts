import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { ApiService } from '../../../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-ukom-rejected-list',
    standalone: true,
    imports: [PagableComponent, CommonModule],
    templateUrl: './ukom-rejected-list.component.html',
    styleUrl: './ukom-rejected-list.component.scss'
})
export class UkomRejectedListComponent {
    pagable: Pagable
    jabatanNameCache: { [key: string]: string } = {}
    refresh: boolean = false

    constructor (private router: Router, private apiService: ApiService) {}

    ngOnInit () {
        this.handlePagable()
        this.getJabatanList()
    }

    getJabatanList () {
        this.apiService.getData('/api/v1/jabatan').subscribe({
            next: response => {
                response.forEach((item: any) => {
                    this.jabatanNameCache[item.code] = item.name
                })
                this.refresh = !this.refresh
            }
        })
    }

    handlePagable () {
        this.pagable = new PagableBuilder(
            '/api/v1/participant_ukom/task/failed/search'
        )
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jabatan Yang Dituju', (data: any) => {
                        return (
                            this.jabatanNameCache[data.nextJabatanCode] || '-'
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
                    .withField('Jabatan Yang Dituju', 'select')
                    .withDefaultValue('')
                    .setOptionList([
                        {
                            label: 'Analis Perdagangan',
                            value: 'JB1'
                        },
                        {
                            label: 'Pengawas Perdagangan',
                            value: 'JB4'
                        },
                        {
                            label: 'Penguji Mutu Barang',
                            value: 'JB7'
                        },
                        {
                            label: 'Pengamat Tera',
                            value: 'JB10'
                        },
                        {
                            label: 'Penera',
                            value: 'JB11'
                        },
                        {
                            label: 'Negosiator Perdagangan',
                            value: 'JB5'
                        }
                    ])
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
    }
}
