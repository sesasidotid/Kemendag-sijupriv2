import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-unit-kerja-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './unit-kerja-list.component.html',
  styleUrl: './unit-kerja-list.component.scss'
})
export class UnitKerjaListComponent {
  pagable: Pagable

  constructor (private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/unit_kerja/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Instansi', 'instansi|name').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((unitKerja: any) => {
            this.router.navigate([`/maintenance/unit-kerja/${unitKerja.id}`])
          }, 'info')
          .withIcon('detail')
          //   .addInactiveCondition((unitKerja: Instansi) => {
          //     return true
          //   })
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name')
          .withField('Nama', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('instansi|name')
          .withField('Instansi', 'text')
          .build()
      )
      .build()
  }
}
