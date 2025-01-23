import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
@Component({
  selector: 'app-ukom-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './ukom-list.component.html',
  styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
  pagable: Pagable
  id: string = LoginContext.getUserId()

  constructor (private router: Router) {
    this.pagable = new PagableBuilder(`/api/v1/participant_ukom/all/${this.id}`)
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis Ukom', (data: any) =>
            data.jenisUkom === 'KENAIKAN_JENJANG'
              ? 'Kenaikan Jenjang'
              : data.jenisUkom === 'PERPINDAHAN_JABATAN'
              ? 'Perpindahan Jabatan'
              : data.jenisUkom
          )
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal', 'lastUpdated').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.router.navigate([`/ukom/ukom-list/detail/${ukom.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )

      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('taskStatus')
          .withField('Status', 'text')
          .build()
      )
      .build()
  }
}
