import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { LoginContext } from '../../../../modules/base/commons/login-context'

@Component({
  selector: 'app-ukom-task-list',
  standalone: true,
  imports: [CommonModule, PagableComponent],
  templateUrl: './ukom-task-list.component.html',
  styleUrl: './ukom-task-list.component.scss'
})
export class UkomTaskListComponent {
  pagable: Pagable

  constructor (private router: Router) {
    // this.pagable = new PagableBuilder('/api/v1/peserta_ukom/task/search')
    this.pagable = new PagableBuilder(
      'http://localhost:4200/assets/mockdata/ukom-list-mockdata.json'
    )
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'NIP').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'Email').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'Nama').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Status', 'Status').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((pendingTask: any) => {
            this.router.navigate([`/ukom/ukom-task-list/${pendingTask.id}`])
            // alert('Detail for peserta ukom, masih menunggu api sesungguhnya')
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('NIP')
          .withField('NIP', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('Email')
          .withField('Email', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('Nama')
          .withField('Nama', 'text')
          .build()
      )
      .build()
  }
}
