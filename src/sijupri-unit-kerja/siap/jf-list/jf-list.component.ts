import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { Router, RouterLink } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { TabService } from '../../../modules/base/services/tab.service';

@Component({
  selector: 'app-jf-list',
  standalone: true,
  imports: [PagableComponent, RouterLink],
  templateUrl: './jf-list.component.html',
  styleUrl: './jf-list.component.scss'
})
export class JfListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
    private tabService: TabService,
  ) {
    this.pagable = new PagableBuilder("/api/v1/jf/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'user|name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Email", 'user|email').build())
      .addActionColumn(new ActionColumnBuilder().setAction((jf: any) => {
        this.router.navigate([LoginContext.getUserLoginRoute() +`/siap/user-jf/${jf.nip}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("nip").withField("NIP", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("user|name").withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("user|email").withField("Email", "text").build())
      .build();
  }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar User Jabatan Fungsional',
      isActive: true,
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() +`/siap/user-jf`]),
    }).addTab({
      label: 'Tambah User Jabatan Fungsional',
      onClick: () => this.router.navigate([LoginContext.getUserLoginRoute() +`/siap/user-jf/add`]),
    });
  }
}
