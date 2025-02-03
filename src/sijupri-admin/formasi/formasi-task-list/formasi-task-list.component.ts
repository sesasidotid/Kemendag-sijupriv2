import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-formasi-task-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './formasi-task-list.component.html',
  styleUrl: './formasi-task-list.component.scss'
})
export class FormasiTaskListComponent {
  pagable: Pagable

  constructor (private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/formasi/task/search')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal', 'dateCreated').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Unit Kerja', 'objectName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'taskStatus').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((pendingTask: any) => {
            this.router.navigate([
              `/formasi/formasi-task-list/${pendingTask.objectGroup}`
            ])
          }, 'info')
          .withIcon('detail')
          .addInactiveCondition(
            (pendingTask: any) => pendingTask.flowId == 'for_flow_1'
          )
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('objectName')
          .withField('Unit Kerja', 'text')
          .build()
      )
      .build()
  }
}
