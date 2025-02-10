import { Component } from '@angular/core'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
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
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { BehaviorSubject } from 'rxjs'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { UnitKerjaUpdateComponent } from '../unit-kerja-update/unit-kerja-update.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-unit-kerja-list',
  standalone: true,
  imports: [
    PagableComponent,
    ModalComponent,
    UnitKerjaUpdateComponent,
    CommonModule
  ],
  templateUrl: './unit-kerja-list.component.html',
  styleUrl: './unit-kerja-list.component.scss'
})
export class UnitKerjaListComponent {
  pagable: Pagable
  instasiId: string = ''
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  unitKerja: UnitKerja = new UnitKerja()
  constructor (private router: Router, private tabService: TabService) {
    this.instasiId = LoginContext.getInstansiId()

    this.pagable = new PagableBuilder(
      `/api/v1/unit_kerja/instansi/${this.instasiId}`
    )
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      //   .addPrimaryColumn(
      //     new PrimaryColumnBuilder('Instansi', 'instansi|name').build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((unitKerja: any) => {
            this.router.navigate([`/maintenance/unit-kerja/${unitKerja.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((unitKerja: any) => {
            // this.router.navigate([`/${provinsi.nip}`])
            this.toggleModal()
            this.unitKerja = unitKerja
          }, 'primary')
          .withIcon('update')
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

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar Unit Kerja',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate([`/maintenance/unit-kerja`])
      })
      .addTab({
        label: 'Tambah Unit Kerja',
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate([`/maintenance/unit-kerja/add`])
      })
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }
}
