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
import { UkomDocumentAddComponent } from '../ukom-document-add/ukom-document-add.component'

@Component({
  selector: 'app-ukom-document-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, UkomDocumentAddComponent],
  templateUrl: './ukom-document-list.component.html',
  styleUrl: './ukom-document-list.component.scss'
})
export class UkomDocumentListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  pagable: Pagable

  constructor (private tabService: TabService, private router: Router) {
    this.pagable = new PagableBuilder('/api/v1/document_ukom/all')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'dokumenPersyaratanName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis Ukom', (data: any) =>
            data.jenisUkom === 'KENAIKAN_JENJANG'
              ? 'Kenaikan Jenjang'
              : data.jenisUkom === 'PERPINDAHAN_JABATAN'
              ? 'Perpindahan Jabatan'
              : data.jenisUkom === 'PROMOSI'
              ? 'Promosi'
              : data.jenisUkom
          )
          .build()
      )
      //   .addActionColumn(
      //     new ActionColumnBuilder()
      //       .setAction((item: any) => {}, 'info')
      //       .withIcon('detail')
      //       .build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((item: any) => {}, 'danger')
          .withIcon('danger')
          .build()
      )
      //   .addFilter(
      //     new PageFilterBuilder('like')
      //       .setProperty('jenisUkom')
      //       .withField('Jenis Ukom', 'text')
      //       .build()
      //   )
      .build()
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Daftar Dokumen Ukom',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Dokumen Ukom',
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
