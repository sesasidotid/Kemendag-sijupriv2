import { Component, effect, inject, input, signal } from '@angular/core'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PesertaUkom } from '@/modules/ukom/models/peserta-ukom.model'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { TanggalWaktuIndoPipe } from '@/modules/base/pipes/tangga-waktu.pipe'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { FailedTask } from '@/modules/ukom/models/ukom-registration-refactored/failed-task.model'

@Component({
    selector: 'app-rw-ukom-list',
    standalone: true,
    imports: [PagableComponent, CommonModule],
    templateUrl: './rw-ukom-list.component.html',
    styleUrl: './rw-ukom-list.component.scss',
})
export class RwUkomListComponent {
    jfNip = input<string>(null)
    pagable = signal<Pagable>(null)
    rejectedPagable = signal<Pagable>(null)

    jenisUkomService = inject(JenisUkomService)
    router = inject(Router)
    TanggalWaktuIndo = new TanggalWaktuIndoPipe()

    constructor() {
        effect(
            () => {
                const jfNip = this.jfNip()
                if (jfNip) {
                    this.initRWUkomPagable()
                    this.initRWRejectedPagable()
                }
            },
            { allowSignalWrites: true },
        )
    }

    initRWUkomPagable() {
        const endpoint = `/api/v1/participant_ukom/search/${this.jfNip()}`
        const pagable = new PagableBuilder(endpoint)
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: PesertaUkom) => {
                        return this.jenisUkomService.getLabelByValue(
                            data.jenisUkom,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Tanggal', (data: PesertaUkom) => {
                        const formattedDate = this.TanggalWaktuIndo.transform(
                            data.dateCreated,
                        )
                        return formattedDate
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((ukom: PesertaUkom) => {
                        this.goToRWUkomDetail(ukom.id)
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .build()

        this.pagable.set(pagable)
    }

    initRWRejectedPagable() {
        const endpoint = `/api/v1/participant_ukom/task/failed/search`

        const rejectedPagable = new PagableBuilder(endpoint)
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: FailedTask) => {
                        return this.jenisUkomService.getLabelByValue(
                            data.jenisUkom,
                        )
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Tanggal', (data: FailedTask) => {
                        const formattedDate = this.TanggalWaktuIndo.transform(
                            data.dateCreated,
                        )

                        return formattedDate
                    })
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: FailedTask) => {
                        this.goToRWRejectedUkomDetail(data.id)
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('nip')
                    .withDefaultValue(this.jfNip())
                    .build(),
            )
            .build()

        this.rejectedPagable.set(rejectedPagable)
    }

    goToRWUkomDetail(participantId: string) {
        this.router.navigate([
            `/ukom/ukom-list/${this.jfNip()}/${participantId}`,
        ])
    }

    goToRWRejectedUkomDetail(participantId: string) {
        this.router.navigate([
            `/ukom/ukom-list/rejected/detail/${participantId}`,
        ])
    }
}
