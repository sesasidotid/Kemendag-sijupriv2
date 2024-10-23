import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router, RouterLink } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-unit-kerja-list',
  standalone: true,
  imports: [PagableComponent, RouterLink],
  templateUrl: './unit-kerja-list.component.html',
  styleUrl: './unit-kerja-list.component.scss'
})
export class UnitKerjaListComponent {
  pagable: Pagable;

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/unit_kerja/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Instansi", 'instansi|name').build())
      .addActionColumn(new ActionColumnBuilder().setAction((unitKerja: any) => {
        this.router.navigate([`/${unitKerja.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("instansi|name").withField("Instansi", "text").build())
      .build();
  }
}
