import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-jabatan-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './rw-jabatan-list.component.html',
  styleUrl: './rw-jabatan-list.component.scss'
})
export class RwJabatanListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_jabatan/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Jabatan", 'jabatan|name').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Jenjang", 'jenjang|name').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("TMT", 'tmt').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwJabatan: any) => {
          this.router.navigate([LoginContext.getUserLoginRoute() +`/${rwJabatan.id}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("like").setProperty("jabatan|name").withField("Jabatan", "text").build())
        .addFilter(new PageFilterBuilder("like").setProperty("jenjang|name").withField("Jenjang", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }
}
