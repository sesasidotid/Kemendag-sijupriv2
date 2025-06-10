import { IndikatorKompetensiUkom } from './../../../../modules/ukom/models/indikator-kompetensi'
import { Component } from '@angular/core'
import { TabService } from '../../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { ApiService } from '../../../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'

@Component({
    selector: 'app-ukom-kompetensi-detail-pagable',
    standalone: true,
    imports: [CommonModule, PagableComponent],
    templateUrl: './ukom-kompetensi-detail-pagable.component.html',
    styleUrl: './ukom-kompetensi-detail-pagable.component.scss'
})
export class UkomKompetensiDetailPagableComponent {
    pagable: Pagable

    constructor (private apiService: ApiService, private router: Router) {}

    ngOnInit () {
        this.handlePagable()
    }

    handlePagable (): void {
        this.pagable = new PagableBuilder('/api/v1/kompetensi_indikator/search')
            .addPrimaryColumn(new PrimaryColumnBuilder('Kode', 'code').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: IndikatorKompetensiUkom) => {
                        this.router.navigate([
                            `maintenance/kompetensi-list/${data.kompetensiId}/indikator/${data.id}`
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: IndikatorKompetensiUkom) => {
                        // this.setDefaultFormValues(data)
                        // this.toggleModal()
                    }, 'primary')
                    .withIcon('update')
                    .build()
            )
            .build()
    }
}
