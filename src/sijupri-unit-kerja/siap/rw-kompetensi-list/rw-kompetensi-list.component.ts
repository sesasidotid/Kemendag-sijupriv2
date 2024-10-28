import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-kompetensi-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './rw-kompetensi-list.component.html',
  styleUrl: './rw-kompetensi-list.component.scss'
})
export class RwKompetensiListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_kompetensi/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Kompetensi", 'name').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Mulai", 'dateStart').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Sertifikat", 'tglSertifikat').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwKompetensi: any) => {
          this.router.navigate([`/${rwKompetensi.id}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("like").setProperty("tglSertifikat").withField("Tgl Sertifikat", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }
}
