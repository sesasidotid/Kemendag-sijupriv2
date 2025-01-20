import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
@Component({
  selector: 'app-ukom-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './ukom-list.component.html',
  styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
  pagable: Pagable
  id: string = LoginContext.getUserId()

  constructor () {
    this.pagable = new PagableBuilder(
      `/api/v1/participant_ukom/task/nip/${this.id}`
    )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Diajukan Pada', 'flowId').build()
      )
      //   .addPrimaryColumn(
      //     new PrimaryColumnBuilder('Selesai Pada', 'lastUpdated').build()
      //   )
      //   .addPrimaryColumn(
      //     new PrimaryColumnBuilder('Status', 'taskStatus').build()
      //   )
      //   .addFilter(
      //     new PageFilterBuilder('equal')
      //       .setProperty('objectGroup')
      //       .withDefaultValue(LoginContext.getUserId())
      //       .build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            // this.router.navigate([`/akp/akp-list/detail/${akp.id}`])
            alert('Detail')
          }, 'info')
          .withIcon('detail')
          .build()
      )

      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('taskStatus')
          .withField('Status', 'text')
          .build()
      )

      .build()
  }
}
