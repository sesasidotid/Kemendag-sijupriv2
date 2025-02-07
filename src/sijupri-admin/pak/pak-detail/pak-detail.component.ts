import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router'
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { NgChartsModule } from 'ng2-charts'
import { ChartData, ChartOptions } from 'chart.js'

@Component({
  selector: 'app-pak-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PagableComponent,
    RouterOutlet,
    NgChartsModule
  ],
  templateUrl: './pak-detail.component.html',
  styleUrl: './pak-detail.component.scss'
})
export class PakDetailComponent {
  rwKinerja: RWKinerja = new RWKinerja()
  pagable: Pagable

  rwKinerjaList: RWKinerja[] = []

  radarChartData: ChartData<'radar'> = {
    labels: ['Predikat', 'Nilai Perilaku', 'Kinerja'],
    datasets: []
  }

  constructor (private activatedRoute: ActivatedRoute, private router: Router) {
    this.activatedRoute.paramMap.subscribe(params => {
      var nip = params.get('id')

      this.pagable = new PagableBuilder('/api/v1/rw_kinerja/search')
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Tahunan/Bulanan', 'type').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Tgl Mulai', 'dateStart').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Tgl Selesai', 'dateEnd').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Angka Kredit', 'angkaKredit').build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((rwKinerja: any) => {
              //   this.router.navigate([`/${rwKinerja.nip}`])
              this.router.navigate([`/pak/pak-list/${nip}/${rwKinerja.id}`])
            }, 'info')
            .withIcon('detail')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((rwKinerja: any, event: Event) => {
              const isChecked = (event.target as HTMLInputElement).checked
              if (isChecked) {
                const exists = this.rwKinerjaList.some(
                  item => item.id === rwKinerja.id
                )
                if (!exists) {
                  this.rwKinerjaList.push(rwKinerja)
                }
              } else {
                const index = this.rwKinerjaList.findIndex(
                  item => item.id === rwKinerja.id
                )
                if (index !== -1) {
                  this.rwKinerjaList.splice(index, 1) // Remove the object
                  console.log('Removed:', rwKinerja.id)
                }
              }

              this.setRadarChartData()
            }, 'info')
            .setInputType('checkbox')
            .setChecked((rwKinerja: any) => {
              return this.rwKinerjaList.some(item => item.id === rwKinerja.id)
            })
            .build()
        )
        .addFilter(
          new PageFilterBuilder('equal')
            .setProperty('nip')
            .withDefaultValue(nip)
            .build()
        )
        .build()
    })
  }

  setRadarChartData () {
    this.radarChartData.datasets.length = 0

    this.rwKinerjaList.forEach(rwKinerja => {
      const backgroundColor = this.generateRandomColor()
      const borderColor = this.generateBorderColor()

      this.radarChartData.datasets.push({
        label: `${rwKinerja.dateStart} - ${rwKinerja.dateEnd}`,
        data: [
          rwKinerja.predikatKinerjaValue,
          rwKinerja.ratingHasilValue,
          rwKinerja.ratingKinerjaValue
        ],
        fill: true,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: borderColor
      })
    })
  }

  radarChartOptions (): ChartOptions<'radar'> {
    return {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  }

  private generateRandomColor (): string {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return `rgba(${r}, ${g}, ${b}, 0.2)` // For backgroundColor
  }

  private generateBorderColor (): string {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    return `rgba(${r}, ${g}, ${b}, 1)` // For borderColor
  }
}
