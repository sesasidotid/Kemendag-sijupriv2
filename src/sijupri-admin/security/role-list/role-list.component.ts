import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { PageFilterDao } from '../../../modules/base/daos/page-filter.dao';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { Router } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent {
  pagable: Pagable;

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/role/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name').build())
      .addActionColumn(new ActionColumnBuilder().setAction((role: any) => {
        this.router.navigate([`/security/role/${role.code}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name").withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("equal").setProperty("application|code").withDefaultValue("sijupri-admin").build())
      .build();
  }
}
