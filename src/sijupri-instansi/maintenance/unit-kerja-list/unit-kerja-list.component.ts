import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router, RouterLink } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { TabService } from '../../../modules/base/services/tab.service';

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
    private router: Router,
    private tabService: TabService
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

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar Unit Kerja',
      isActive: true,
      onClick: () => this.router.navigate([`/maintenance/unit-kerja`]),
    }).addTab({
      label: 'Tambah Unit Kerja',
      onClick: () => this.router.navigate([`/maintenance/unit-kerja/add`]),
    });
  }
}
