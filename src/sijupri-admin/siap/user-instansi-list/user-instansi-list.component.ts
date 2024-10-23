import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router, RouterLink } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { TabService } from '../../../modules/base/services/tab.service';

@Component({
  selector: 'app-user-instansi-list',
  standalone: true,
  imports: [RouterLink, PagableComponent],
  templateUrl: './user-instansi-list.component.html',
  styleUrl: './user-instansi-list.component.scss'
})
export class UserInstansiListComponent {
  pagable: Pagable;

  constructor(
    private tabService: TabService,
    private router: Router,
  ) {
    this.pagable = new PagableBuilder("/api/v1/user_instansi/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'name', ['user']).build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Email", 'email', ['user']).build())
      .addActionColumn(new ActionColumnBuilder().setAction((unitKerja: any) => {
        this.router.navigate([`/${unitKerja.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("nip").withField("NIP", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("name", ["user"]).withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("email", ["user"]).withField("Email", "text").build())
      .build();
  }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar User Instansi',
      isActive: true,
      onClick: () => this.router.navigate(['/siap/user-instansi']),
    }).addTab({
      label: 'Tambah User Instansi',
      onClick: () => this.router.navigate(['/siap/user-instansi/add']),
    });
  }
}
