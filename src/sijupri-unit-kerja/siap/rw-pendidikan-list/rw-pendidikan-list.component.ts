import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-rw-pendidikan-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './rw-pendidikan-list.component.html',
  styleUrl: './rw-pendidikan-list.component.scss'
})
export class RwPendidikanListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_pendidikan/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Pendidikan", 'pendidikan|name').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal Ijazah", 'tanggalIjazah').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwPendidikan: any) => {
          this.router.navigate([`/${rwPendidikan.id}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("like").setProperty("pendidikan|name").withField("Pendidikan", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }
}
