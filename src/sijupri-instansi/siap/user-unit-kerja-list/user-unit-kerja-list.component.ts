import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { TabService } from '../../../modules/base/services/tab.service';

@Component({
  selector: 'app-user-unit-kerja-list',
  standalone: true,
  imports: [RouterLink, PagableComponent],
  templateUrl: './user-unit-kerja-list.component.html',
  styleUrl: './user-unit-kerja-list.component.scss'
})
export class UserUnitKerjaListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private tabService: TabService
  ) {
    this.pagable = new PagableBuilder("/api/v1/user_unit_kerja/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name', ['user']).build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Email", 'email', ['user']).build())
      .addActionColumn(new ActionColumnBuilder().setAction((unitKerja: any) => {
        this.router.navigate([LoginContext.getUserLoginRoute() +`/${unitKerja.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("nip").withField("NIP", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name", ["user"]).withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("email", ["user"]).withField("Email", "text").build())
      .build();
  }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar User Unit Kerja',
      isActive: true,
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() +`/siap/user-unit-kerja`]),
    }).addTab({
      label: 'Tambah User Unit Kerja',
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() +`/siap/user-unit-kerja/add`]),
    });
  }
}
