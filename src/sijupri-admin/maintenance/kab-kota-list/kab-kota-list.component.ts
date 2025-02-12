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
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TabService } from '../../../modules/base/services/tab.service'
import { KabKotaAddComponent } from '../kab-kota-add/kab-kota-add.component'
import { KabKotaUpdateComponent } from '../kab-kota-update/kab-kota-update.component'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { KabKota } from '../../../modules/maintenance/models/kab-kota.model'
@Component({
  selector: 'app-kab-kota-list',
  standalone: true,
  imports: [
    PagableComponent,
    KabKotaAddComponent,
    CommonModule,
    KabKotaUpdateComponent,
    ModalComponent
  ],
  templateUrl: './kab-kota-list.component.html',
  styleUrl: './kab-kota-list.component.scss'
})
export class KabKotaListComponent {
  pagable: Pagable
  tab$ = new BehaviorSubject<number | null>(0)
  refreshToggle: boolean = false
  isModalOpen$ = new BehaviorSubject<boolean>(false)
  updateKabKotaData = new KabKota()

  refresh: boolean = false

  constructor (private router: Router, private tabService: TabService) {
    this.pagable = new PagableBuilder('/api/v1/kab_kota/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Tipe', 'type').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Provinsi', 'provinsi|name').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((kabKota: any) => {
            // this.router.navigate([`/maintenance/kab-kota/${kabKota.id}`])
            this.toggleModal()
            this.updateKabKotaData = kabKota
          }, 'primary')
          .withIcon('update')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name')
          .withField('Nama Kab/Kota', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('type')
          .withField('Tipe', 'select')
          .setOptionList([
            { label: 'KABUPATEN', value: 'KABUPATEN' },
            { label: 'KOTA', value: 'KOTA' }
          ])
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('provinsi|name')
          .withField('Provinsi', 'text')
          .build()
      )
      .build()
  }

  toggleRefresh () {
    this.refresh = !this.refresh
    this.isModalOpen$.next(false)
  }
  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Kabupaten Kota',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Kabupaten Kota',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  handleTabChange (tab?: number) {
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }
}
