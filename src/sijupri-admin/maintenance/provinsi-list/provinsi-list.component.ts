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
import { TabService } from '../../../modules/base/services/tab.service'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { Wilayah } from '../../../modules/maintenance/models/wilayah.model'
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Provinsi } from '../../../modules/maintenance/models/provinsi.model'
import { ProvinsiAddComponent } from '../provinsi-add/provinsi-add.component'
import { ProvinsiUpdateComponent } from '../provinsi-update/provinsi-update.component'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
@Component({
  selector: 'app-provinsi-list',
  standalone: true,
  imports: [
    PagableComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ProvinsiAddComponent,
    ProvinsiUpdateComponent,
    ModalComponent
  ],
  templateUrl: './provinsi-list.component.html',
  styleUrl: './provinsi-list.component.scss'
})
export class ProvinsiListComponent {
  pagable: Pagable
  tab$ = new BehaviorSubject<number | null>(0)
  refreshToggle: boolean = false
  wilayahList: Wilayah[] = []
  provinsi: Provinsi = new Provinsi()
  updateProvinsiData = new Provinsi()
  isModalOpen$ = new BehaviorSubject<boolean>(false)
  refresh: boolean = false

  constructor (private router: Router, private tabService: TabService) {
    this.pagable = new PagableBuilder('/api/v1/provinsi/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((provinsi: any) => {
            this.toggleModal()
            this.updateProvinsiData = provinsi
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
      .build()
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
    console.log(';lasd', this.isModalOpen$.value)
  }

  toggleRefresh () {
    console.log('refresh')
    this.toggleModal()
    this.refresh = !this.refresh
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Provinsi',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Provinsi',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  handleTabChange (tab?: number) {
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }
}
