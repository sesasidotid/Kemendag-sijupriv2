import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { TabService } from '../../../../modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { BehaviorSubject } from 'rxjs'
import { UkomClassAddComponent } from '../ukom-class-add/ukom-class-add.component'

@Component({
  selector: 'app-ukom-class-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, UkomClassAddComponent],
  templateUrl: './ukom-class-list.component.html',
  styleUrl: './ukom-class-list.component.scss'
})
export class UkomClassListComponent {
  tab$ = new BehaviorSubject<number | null>(0)

  pagable: Pagable
  data: any[] = []

  constructor (
    private tabService: TabService,
    private router: Router,
    private handlerService: HandlerService
  ) {
    this.pagable = new PagableBuilder('/api/v1/room_ukom/search')

      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Kuota Peserta', 'participantQuota').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Mulai', 'examStartAt').build()
      )
      .addPrimaryColumn(new PrimaryColumnBuilder('Jam', 'examEndAt').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('jabatanCode', 'jenjangCode').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('jenjangCode', 'jenjangCode').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.router.navigate([`/ukom/ukom-periode/${ukom.id}`])
          }, 'info')
          .withIcon('detail')
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
        label: 'Daftar Kelas',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Kelas',
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
