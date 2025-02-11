import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { PageFilterDao } from '../../../modules/base/daos/page-filter.dao'
import { Router, RouterLink } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { TabService } from '../../../modules/base/services/tab.service'
import { LoginContext } from '../../../modules/base/commons/login-context'

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [PagableComponent, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  pagable: Pagable

  constructor (private tabService: TabService, private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/user/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'id').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'email').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Status', 'status').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((user: any) => {
            this.router.navigate([`/security/user/${user.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('id')
          .withField('NIP', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name')
          .withField('Nama', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('userApplicationChannel|applicationCode')
          .withDefaultValue('sijupri-admin')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('userApplicationChannel|channelCode')
          .withDefaultValue('WEB')
          .build()
      )
      .build()
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar User',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate([`/security/user`])
      })
      .addTab({
        label: 'Tambah User',
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate([`/security/user/add`])
      })
  }
}
