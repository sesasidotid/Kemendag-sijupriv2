import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-kab-kota-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './kab-kota-list.component.html',
  styleUrl: './kab-kota-list.component.scss'
})
export class KabKotaListComponent {
  pagable: Pagable;

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/kab_kota/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tipe", 'type').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Provinsi", 'provinsi|name').build())
      .addActionColumn(new ActionColumnBuilder().setAction((kabKota: any) => {
        this.router.navigate([LoginContext.getUserLoginRoute() + `/${kabKota.nip}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama Kab/Kota", "text").build())
      .addFilter(new PageFilterBuilder("equal").setProperty("type").withField("Tipe", "select").setOptionList([
        { label: 'KABUPATEN', value: 'KABUPATEN' },
        { label: 'KOTA', value: 'KOTA' },
      ]).build())
      .addFilter(new PageFilterBuilder("like").setProperty("provinsi|name").withField("Provinsi", "text").build())
      .build();
  }
}
