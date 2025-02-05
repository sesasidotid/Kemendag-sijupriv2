import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { BehaviorSubject } from 'rxjs'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { Router } from '@angular/router'
import { ConverterService } from './../../../modules/base/services/converter.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-formasi-data-rekomendasi',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './formasi-data-rekomendasi.component.html',
  styleUrl: './formasi-data-rekomendasi.component.scss'
})
export class FormasiDataRekomendasiComponent {
  pagable: Pagable

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private converterService: ConverterService,
    private router: Router
  ) {
    this.pagable = new PagableBuilder(`/api/v1/formasi/search`)
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal Pengajuan', 'dateCreated').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Unit Kerja', 'unitKerjaName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'formasiStatus').build()
      )

      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('unit_kerja|name')
          .withField('Unit Kerja', 'text')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .withIcon('detail')
          .setAction((formasi: any) => {
            this.router.navigate([
              `/formasi/formasi-rekomendasi-list/${formasi.id}`
            ])
          }, 'info')
          .build()
      )
      .build()
  }
}
