import { Component, OnInit } from '@angular/core'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import {
    SuratRekomModel,
    SuratRekomStatus,
} from '@/modules/ukom/models/surat-rekom/surat-rekom.model'

@Component({
    selector: 'app-ukom-grade-surat-rekom',
    standalone: true,
    imports: [PagableComponent],
    templateUrl: './ukom-grade-surat-rekom.component.html',
    styleUrl: './ukom-grade-surat-rekom.component.scss',
})
export class UkomGradeSuratRekomComponent implements OnInit {
    pagable: Pagable
    ngOnInit() {
        this.initPagable()
    }

    initPagable() {
        this.pagable = new PagableBuilder('/api/v1/surat_rekom/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'fileName').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: SuratRekomModel) => {
                        this.handleDownloadRar(data.id)
                    }, 'success')
                    .withIcon('download')
                    .addInactiveCondition((data: SuratRekomModel) => {
                        return data.status != SuratRekomStatus.FINISHED
                    })
                    .build(),
            )
            .withQueryParams()
            .setLimit(5)
            .build()
    }

    handleDownloadRar(id:string){}
}
