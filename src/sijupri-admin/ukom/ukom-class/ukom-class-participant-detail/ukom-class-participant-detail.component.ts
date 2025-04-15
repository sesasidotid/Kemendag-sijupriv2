import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { ActivatedRoute } from '@angular/router'
import { Router } from '@angular/router'
import { UkomTaskDetailComponent } from '../../ukom-pemetaan/ukom-task-detail/ukom-task-detail.component'
@Component({
    selector: 'app-ukom-class-participant-detail',
    standalone: true,
    imports: [CommonModule, UkomTaskDetailComponent],
    templateUrl: './ukom-class-participant-detail.component.html',
    styleUrl: './ukom-class-participant-detail.component.scss'
})
export class UkomClassParticipantDetailComponent {
    id: string
    pagable!: Pagable

    constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(params => {
            this.id = params.get('id')
        })
    }

    handlePagable() {
        this.pagable = new PagableBuilder(`/api/v1/participant_ukom/${this.id}`)
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'email').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Ukom', (data: any) =>
                        data.jenisUkom === 'KENAIKAN_JENJANG'
                            ? 'Kenaikan Jenjang'
                            : data.jenisUkom === 'PERPINDAHAN_JABATAN'
                                ? 'Perpindahan Jabatan'
                                : data.jenisUkom
                    )
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jenis Kelamin', 'jenisKelaminName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jabatan Awal', 'jabatanName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jenjang Awal', 'jenjangName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Pangkat', 'pangkatName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jabatan Tujuan', 'nextJabatanName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Jenjang Tujuan', 'nextJenjangName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama Instansi', 'instansiName').build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama Unit Kerja', 'unitKerjaName').build()
            )
            .build()
    }
}
