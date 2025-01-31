import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { TabService } from '../../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'

@Component({
  selector: 'app-ukom-task-list',
  standalone: true,
  imports: [CommonModule, PagableComponent],
  templateUrl: './ukom-task-list.component.html',
  styleUrl: './ukom-task-list.component.scss'
})
export class UkomTaskListComponent {
  pagable: Pagable
  pagable$ = new BehaviorSubject<Pagable | null>(null)

  constructor (private router: Router, private tabService: TabService) {
    this.pagable$.next(
      new PagableBuilder('/api/v1/participant_ukom/task/search')

        .addPrimaryColumn(
          new PrimaryColumnBuilder('NIP', 'objectGroup').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Nama', 'objectName').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Proses', 'flowName').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Last Update', 'lastUpdated').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Status', 'taskStatus').build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((pendingTask: any) => {
              this.router.navigate([`/ukom/ukom-task-list/${pendingTask.id}`])
            }, 'info')
            .withIcon('detail')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('equal')
            .setProperty('flowId')
            .withDefaultValue('ukom_flow_1')
            .build()
        )

        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('objectGroup')
            .withField('NIP', 'text')
            .build()
        )
        .addFilter(
          new PageFilterBuilder('like')
            .setProperty('objectName')
            .withField('Nama', 'text')
            .build()
        )
        .build()
    )
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Verifikasi Pengajuan',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handlePagableTabChange('ukom_flow_1', 0)
      })
      .addTab({
        label: 'Perbaikan Dokumen',
        icon: 'mdi-account-supervisor',
        onClick: () => this.handlePagableTabChange('ukom_flow_2', 1)
      })
  }

  handlePagableTabChange (tab: string, tabIndex: number) {
    const currentPagable = this.pagable$.value

    const updatedPagable = {
      ...currentPagable,
      filterLIst: currentPagable.filterLIst.map((item, index) =>
        item.key === 'eq_flowId' ? { ...item, value: tab } : item
      )
    }

    this.tabService.changeTabActive(tabIndex)
    this.pagable$.next(updatedPagable)
  }
}
