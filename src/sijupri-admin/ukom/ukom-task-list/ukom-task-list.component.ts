import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';

@Component({
  selector: 'app-ukom-task-list',
  standalone: true,
  imports: [
    CommonModule,
    PagableComponent
  ],
  templateUrl: './ukom-task-list.component.html',
  styleUrl: './ukom-task-list.component.scss'
})
export class UkomTaskListComponent {
  pagable: Pagable;

  constructor(
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/peserta_ukom/task/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("NIP", 'objectId').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Nama", 'objectName').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Status", 'flowName').build())
      .addActionColumn(new ActionColumnBuilder().setAction((pendingTask: any) => {
        this.router.navigate([`/ukom/ukom-task-list/${pendingTask.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectId").withField("NIP", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("objectName").withField("Nama", "text").build())
      .addFilter(new PageFilterBuilder("like").setProperty("flowName").withField("Status", "text").build())
      .build();
  }
}
