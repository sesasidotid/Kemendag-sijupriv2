import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { TabService } from '../../../../modules/base/services/tab.service'
import { Router, RouterLink } from '@angular/router'
import { UkomExaminerAddComponent } from '../ukom-examiner-add/ukom-examiner-add.component'

@Component({
  selector: 'app-ukom-examiner-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, UkomExaminerAddComponent],
  templateUrl: './ukom-examiner-list.component.html',
  styleUrl: './ukom-examiner-list.component.scss'
})
export class UkomExaminerListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  pagable: Pagable

  constructor (private tabService: TabService, private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/examiner_ukom/search')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'name', ['user']).build()
      )
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'status', ['user']).build()
      )
      .build()
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar Examiner',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Examiner',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }
}
