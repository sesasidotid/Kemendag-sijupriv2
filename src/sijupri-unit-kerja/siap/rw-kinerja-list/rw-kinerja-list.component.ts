import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-kinerja-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './rw-kinerja-list.component.html',
  styleUrl: './rw-kinerja-list.component.scss'
})
export class RwKinerjaListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id');

      this.pagable = new PagableBuilder("/api/v1/rw_kinerja/search")
        .addPrimaryColumn(new PrimaryColumnBuilder("Tahunan/Bulanan", 'type').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Mulai", 'dateStart').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Tgl Selesai", 'dateEnd').build())
        .addPrimaryColumn(new PrimaryColumnBuilder("Angka Kredit", 'angkaKredit').build())
        .addActionColumn(new ActionColumnBuilder().setAction((rwKinerja: any) => {
          this.router.navigate([`/${rwKinerja.id}`])
        }, "info").withIcon("detail").build())
        .addFilter(new PageFilterBuilder("like").setProperty("pangkat|name").withField("Tahunan/Bulanan", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("dateStart").withField("Tgl Mulai", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("dateEnd").withField("Tgl Selesai", "text").build())
        .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(nip).build())
        .build();
    });
  }
}
