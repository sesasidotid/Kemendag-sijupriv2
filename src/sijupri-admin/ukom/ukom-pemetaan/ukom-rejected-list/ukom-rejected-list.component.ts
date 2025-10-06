import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { ApiService } from '../../../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { FailedTask } from '@/modules/ukom/models/ukom-registration-refactored/failed-task.model'

@Component({
    selector: 'app-ukom-rejected-list',
    standalone: true,
    imports: [PagableComponent, CommonModule],
    templateUrl: './ukom-rejected-list.component.html',
    styleUrl: './ukom-rejected-list.component.scss',
})
export class UkomRejectedListComponent {
    pagable: Pagable
    jabatanNameCache: { [key: string]: string } = {}
    refresh: boolean = false

    constructor(
        private router: Router,
        private jenisUkomService: JenisUkomService,
    ) {}

    ngOnInit() {
        this.initPagable()
    }

    initPagable() {
        this.pagable = new PagableBuilder(
            '/api/v1/participant_ukom/task/failed/search',
        )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('NIP', 'objectGroup').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'objectName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Jabatan Yang Dituju',
                    'nextJabatanName',
                ).build(),
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
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: FailedTask) => {
                        this.router.navigate([
                            // `/ukom/ukom-task-list/${ukom.id}`,
                            `/ukom/ukom-list/rejected/detail/${ukom.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
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
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('nextJabatanCode')
                    .withField('Jabatan Yang Dituju', 'select')
                    .withDefaultValue('')
                    .setOptionList([
                        {
                            label: 'Analis Perdagangan',
                            value: 'JB1',
                        },
                        {
                            label: 'Pengawas Perdagangan',
                            value: 'JB4',
                        },
                        {
                            label: 'Penguji Mutu Barang',
                            value: 'JB7',
                        },
                        {
                            label: 'Pengamat Tera',
                            value: 'JB10',
                        },
                        {
                            label: 'Penera',
                            value: 'JB11',
                        },
                        {
                            label: 'Negosiator Perdagangan',
                            value: 'JB5',
                        },
                    ])
                    .build(),
            )
            .build()
    }
}
