import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'

@Component({
  selector: 'app-akp-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './akp-list.component.html',
  styleUrl: './akp-list.component.scss'
})
export class AkpListComponent {
  pagable: Pagable

  constructor (private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/jf/search')
      // this.pagable = new PagableBuilder('/api/v1/akp/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'name', ['user'])
          //   .withSortable(false)
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Email', 'email', ['user'])
          //   .withSortable(false)
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'status', ['user'])
          //   .withSortable(false)
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((jf: any) => {
            this.router.navigate([`/akp/akp-list/${jf.nip}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('nip')
          .withField('NIP', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('user|name')
          .withField('Nama', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('user|email')
          .withField('Email', 'text')
          .build()
      )
      .build()
  }
}
