import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-provinsi-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './provinsi-list.component.html',
  styleUrl: './provinsi-list.component.scss'
})
export class ProvinsiListComponent {
  pagable: Pagable;

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/provinsi/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name').build())
      .addActionColumn(new ActionColumnBuilder().setAction((provinsi: any) => {
        this.router.navigate([`/${provinsi.nip}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama", "text").build())
      .build();
  }
}
