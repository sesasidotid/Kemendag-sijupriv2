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
import { UkomGradeExportComponent } from '../ukom-grade-export/ukom-grade-export.component'
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
        new PrimaryColumnBuilder()
          .withDynamicValue('NB Wawancara', (item: any) => {
            return this.rounding(item.nbWawancara)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Skor Wawancara', (item: any) => {
            return this.rounding(item.wawancaraGradeScore)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('NB Seminar', (item: any) => {
            return this.rounding(item.nbSeminar)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Skor Seminar', (item: any) => {
            return this.rounding(item.seminarGradeScore)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('NB Praktik', (item: any) => {
            return this.rounding(item.nbPraktik)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Skor Praktik', (item: any) => {
            return this.rounding(item.praktikGradeScore)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('NB Portofolio', (item: any) => {
            return this.rounding(item.nbPortofolio)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Skor Portofolio', (item: any) => {
            return this.rounding(item.portofolioGradeScore)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('JPM', (item: any) => {
            return this.rounding(item.jpm)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Skor', (item: any) => {
            return this.rounding(item.score)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('NB UKT', (item: any) => {
            return this.rounding(item.nbUkt)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('UKT', (item: any) => {
            return this.rounding(item.ukt)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('UKMSK', (item: any) => {
            return this.rounding(item.ukmsk)
          })
          .build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Nilai Akhir', (item: any) => {
            return this.rounding(item.grade)
          })
          .build()
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
          .withField('Nama', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('roomUkom|name')
          .withField('Kelas', 'text')
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((participantUkom: any) => {}, 'primary')
          .addInactiveCondition(() => true)
          .withIcon('update')
          .build()
      )
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
      .addTab({
        label: 'Export Nilai',
        isActive: false,
        icon: 'mdi-export',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list/export`])
      })
  }
}
