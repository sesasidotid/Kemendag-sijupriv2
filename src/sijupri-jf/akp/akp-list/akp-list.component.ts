import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { Router } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';

@Component({
  selector: 'app-akp-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './akp-list.component.html',
  styleUrl: './akp-list.component.scss'
})
export class AkpListComponent {
  pagable: Pagable; 

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/akp/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama Atasan", 'namaAtasan').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Email Atasan", 'emailAtasan').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Diajukan Pada", 'dateCreated').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Selesai Pada", 'lastUpdated').build())
      .addActionColumn(new ActionColumnBuilder().setAction((akp: any) => {
        this.router.navigate([`/akp/akp-list/detail/${akp.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("equal").setProperty("nip").withDefaultValue(LoginContext.getUserId()).build())
      .addFilter(new PageFilterBuilder("like").setProperty("namaAtasan").withField("Nama Atasan", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("emailAtasan").withField("Email Atasan", "text").build())
      .build();
  }
}
