import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'

@Component({
  selector: 'app-ukom-detail',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './ukom-detail.component.html',
  styleUrl: './ukom-detail.component.scss'
})
export class UkomDetailComponent {
  pagable: Pagable

  constructor () {
    this.pagable = new PagableBuilder(
      'http://localhost:4200/assets/mockdata/ukom-user-history.json'
    )
      .addPrimaryColumn(new PrimaryColumnBuilder('Periode', 'Periode').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Status', 'Status').build())
      .addActionColumn(new ActionColumnBuilder().withIcon('detail').build())
      .build()
  }
}
