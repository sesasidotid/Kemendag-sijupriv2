import { Component } from '@angular/core'
import { TabService } from '../../../../modules/base/services/tab.service'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { UkomKompetensiAddComponent } from '../ukom-kompetensi-add/ukom-kompetensi-add.component'
import { CommonModule } from '@angular/common'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'

@Component({
  selector: 'app-ukom-kompetensi-list',
  standalone: true,
  imports: [PagableComponent, UkomKompetensiAddComponent, CommonModule],
  templateUrl: './ukom-kompetensi-list.component.html',
  styleUrl: './ukom-kompetensi-list.component.scss'
})
export class UkomKompetensiListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  pagable: Pagable
  jabatanList: Jabatan[] = []
  jenjangList: Jenjang[] = []

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tabService: TabService
  ) {
    this.pagable = new PagableBuilder(`/api/v1/kompetensi/search`)
      .addPrimaryColumn(new PrimaryColumnBuilder('Kode', 'code').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jabatan', (data: any) => {
            const matchingJabatan = this.jabatanList.find(
              (jabatan: Jabatan) => jabatan.code === data.jabatanCode
            )
            return matchingJabatan ? matchingJabatan.name : null
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenjang', (data: any) => {
            const matchingJenjang = this.jenjangList.find(
              (jenjang: Jenjang) => jenjang.code === data.jenjangCode
            )
            return matchingJenjang ? matchingJenjang.name : null
          })
          .build()
      )
      //   .addPrimaryColumn(
      //     new PrimaryColumnBuilder()
      //       .withDynamicValue('Jenis Ukom', (data: any) =>
      //         data.jenisUkom === 'KENAIKAN_JENJANG'
      //           ? 'Kenaikan Jenjang'
      //           : data.jenisUkom === 'PERPINDAHAN_JABATAN'
      //           ? 'Perpindahan Jabatan'
      //           : data.jenisUkom
      //       )
      //       .build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            // this.router.navigate([
            //   `/ukom/ukom-room-list/detail-participant/${data.id}`
            // ])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .build()
  }

  ngOnInit () {
    this.getJabatanList()
    this.getJenjangList()

    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Kompetensi',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Kompetensi',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  getJabatanList () {
    this.apiService.getData('/api/v1/jabatan').subscribe({
      next: (response: any) => {
        this.jabatanList = response.map(
          (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
        )
      }
    })
  }

  getJenjangList () {
    this.apiService.getData('/api/v1/jenjang/').subscribe({
      next: (response: any) => {
        this.jenjangList = response.map(
          (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
        )
      }
    })
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }
}
