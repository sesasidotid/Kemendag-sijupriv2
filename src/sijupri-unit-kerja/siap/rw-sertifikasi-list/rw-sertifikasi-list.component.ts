import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-sertifikasi-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './rw-sertifikasi-list.component.html',
  styleUrl: './rw-sertifikasi-list.component.scss'
})
export class RwSertifikasiListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    var nip
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_sertifikasi/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Pangkat", 'pangkat|name').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("No. SK", 'noSk').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl SK", 'tglSk').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Wilayah Kerja", 'wilayahKerja').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Mulai", 'dateStart').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("UU Kawalan", 'uuKawalan').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwSertifikasi: any) => {
          this.router.navigate([LoginContext.getUserLoginRoute() +`/${rwSertifikasi.id}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("like").setProperty("noSk").withField("No. SK", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("tglSk").withField("Tgl SK", "text").build())
        .addFilter(new PageFilterBuilder("like").setProperty("wilayahKerja").withField("Wilayah Kerja", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }
}
