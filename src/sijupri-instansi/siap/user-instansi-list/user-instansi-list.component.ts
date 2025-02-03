import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'

@Component({
  selector: 'app-user-instansi-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './user-instansi-list.component.html',
  styleUrl: './user-instansi-list.component.scss'
})
export class UserInstansiListComponent {
  pagable: Pagable

  constructor (private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/user_instansi/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'user|name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'user|email').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((unitKerja: any) => {
            this.router.navigate([`/siap/user-instansi/${unitKerja.nip}`])
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
