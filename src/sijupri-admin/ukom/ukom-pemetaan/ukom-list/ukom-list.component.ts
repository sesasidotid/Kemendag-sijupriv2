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

@Component({
  selector: 'app-ukom-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './ukom-list.component.html',
  styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
  pagable: Pagable

  jenisUkomMap: Record<string, string> = {}

  constructor (private router: Router) {}

  ngOnInit () {
    this.handlerPagable()
  }

  handlerPagable () {
    this.pagable = new PagableBuilder('/api/v1/participant_ukom/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'email').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis UKom', (data: any) =>
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
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Status', (data: any) =>
            data.ukomBan != null ? 'Banned' : 'Active'
          )
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.router.navigate([`/ukom/ukom-list/${ukom.nip}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('nip')
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
        new PageFilterBuilder('like')
          .setProperty('user|email')
          .withField('Email', 'text')
          .build()
      )
      .build()
  }
}
