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

@Component({
  selector: 'app-ukom-grade-list',
  standalone: true,
  imports: [PagableComponent],
  templateUrl: './ukom-grade-list.component.html',
  styleUrl: './ukom-grade-list.component.scss'
})
export class UkomGradeListComponent {
  pagable: Pagable

  constructor (private router: Router, private tabService: TabService) {
    this.pagable = new PagableBuilder('/api/v1/ukom_grade/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'participantName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Kelas', 'roomUkomName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('NB CAT', (item: any) => {
            return this.rounding(item.nbCat)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Skor CAT', (item: any) => {
            return this.rounding(item.catGradeScore)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('NB Wawancara', 'nbWawancara').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder(
          'Skor Wawancara',
          'wawancaraGradeScore'
        ).build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('NB Seminar', 'nbSeminar').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Skor Seminar', 'seminarGradeScore').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('NB Praktik', 'nbPraktik').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Skor Praktik', 'praktikGradeScore').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('NB Portofolio', 'nbPortofolio').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder(
          'Skor Portofolio',
          'portofolioGradeScore'
        ).build()
      )
      .addPrimaryColumn(new PrimaryColumnBuilder('JPM', 'jpm').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Skor', 'score').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('NB UKT', 'nbUkt').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('UKT', 'ukt').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('UKMSK', 'ukmsk').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nilai Akhir', 'grade').build()
      )
      .addPrimaryColumn(new PrimaryColumnBuilder('Status', 'status').build())
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('participantUkom|nip')
          .withField('NIP', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('participantUkom|name')
          .withField('Name', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('roomUkom|name')
          .withField('Kelas', 'text')
          .build()
      )
      //   .addActionColumn(
      //     new ActionColumnBuilder()
      //       .setAction((participantUkom: any) => {
      //         this.router.navigate([
      //           `/pak/ukom-grade-list/${participantUkom.nip}`
      //         ])
      //       }, 'info')
      //       .withIcon('detail')
      //       .build()
      //   )
      .build()
  }

  rounding (value: string): string {
    console.log(value) // Check input value
    return parseFloat(value).toFixed(2) // Return the rounded value as a string
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'List Nilai Ukom',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list`])
      })
      .addTab({
        label: 'Import Nilai',
        isActive: false,
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list/import`])
      })
  }
}
