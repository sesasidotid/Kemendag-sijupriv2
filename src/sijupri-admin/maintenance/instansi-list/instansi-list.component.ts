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
import { TabService } from '../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { InstasiAddComponent } from '../instasi-add/instasi-add.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-instansi-list',
  standalone: true,
  imports: [PagableComponent, InstasiAddComponent, CommonModule],
  templateUrl: './instansi-list.component.html',
  styleUrl: './instansi-list.component.scss'
})
export class InstansiListComponent {
  pagable: Pagable
  tab$ = new BehaviorSubject<number | null>(0)
  refreshToggle: boolean = false

  constructor (private router: Router, private tabService: TabService) {
    this.pagable = new PagableBuilder('/api/v1/instansi/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      //   .addActionColumn(
      //     new ActionColumnBuilder()
      //       .setAction((instansi: any) => {
      //         this.router.navigate([`/maintenance/instansi/${instansi.id}`])
      //       }, 'info')
      //       .withIcon('detail')
      //       .build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((item: any) => {}, 'danger')
          .withIcon('danger')
          .addInactiveCondition((item: any) => true)
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name')
          .withField('Nama Kab/Kota', 'text')
          .build()
      )
      .build()
  }

  ngOnInit (): void {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    // this.tabService
    //   .addTab({
    //     label: 'Instasi',
    //     icon: 'mdi-list-box',
    //     isActive: true,
    //     onClick: () => this.handleTabChange(0)
    //   })
    //   .addTab({
    //     label: 'Tambah Instansi',
    //     icon: 'mdi-plus-circle',
    //     onClick: () => this.handleTabChange(1)
    //   })
  }

  handleTabChange (tab?: number) {
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }

  handleRefreshToggle () {
    this.refreshToggle = !this.refreshToggle
  }
}
