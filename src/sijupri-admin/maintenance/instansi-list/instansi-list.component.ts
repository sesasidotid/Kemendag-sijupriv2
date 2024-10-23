import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-instansi-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './instansi-list.component.html',
  styleUrl: './instansi-list.component.scss'
})
export class InstansiListComponent {
  pagable: Pagable;

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/instansi/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name').build())
      .addActionColumn(new ActionColumnBuilder().setAction((instansi: any) => {
        this.router.navigate([`/${instansi.nip}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama Kab/Kota", "text").build())
      .build();
  }
}
