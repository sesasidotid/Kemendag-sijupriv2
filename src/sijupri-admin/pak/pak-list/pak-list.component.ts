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
  selector: 'app-pak-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './pak-list.component.html',
  styleUrl: './pak-list.component.scss'
})
export class PakListComponent {
  pagable: Pagable

  constructor (private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/jf/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'user|name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'user|email').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((jf: any) => {
            this.router.navigate([`/pak/pak-list/${jf.nip}`])
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
