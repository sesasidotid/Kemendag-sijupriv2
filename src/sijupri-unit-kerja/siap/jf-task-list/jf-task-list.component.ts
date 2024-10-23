import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router } from '@angular/router';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';

@Component({
  selector: 'app-jf-task-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './jf-task-list.component.html',
  styleUrl: './jf-task-list.component.scss'
})
export class JfTaskListComponent {
  pagable: Pagable;

  constructor(
    private router: Router,
  ) {
    this.pagable = new PagableBuilder("/api/v1/jf/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'user|name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Email", 'user|email').build())
      .addActionColumn(new ActionColumnBuilder().setAction((jf: any) => {
        this.router.navigate([`/siap/verify-user-jf/${jf.nip}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("nip").withField("NIP", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("user|name").withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("user|email").withField("Email", "text").build())
      .build();
  }
}
