import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { ActivatedRoute, Router } from '@angular/router'
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { NgChartsModule } from 'ng2-charts'
import { ChartData, ChartOptions } from 'chart.js'
import { take } from 'rxjs'

@Component({
    selector: 'app-pak-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, PagableComponent, NgChartsModule],
    templateUrl: './pak-detail.component.html',
    styleUrl: './pak-detail.component.scss'
})
export class PakDetailComponent {
    rwKinerja: RWKinerja = new RWKinerja()
    pagable: Pagable

    rwKinerjaList: RWKinerja[] = []
    nip: string
    radarChartData: ChartData<'radar'> = {
        labels: ['Predikat', 'Nilai Perilaku', 'Kinerja'],
        datasets: []
    }

    constructor (
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit () {
        this.activatedRoute.paramMap.pipe(take(1)).subscribe(params => {
            this.nip = params.get('id')
            this.handlePagable()
        })
    }

    handlePagable () {
        this.pagable = new PagableBuilder('/api/v1/rw_kinerja/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tahunan/Bulanan', 'type').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tgl Mulai', 'dateStart').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tgl Selesai', 'dateEnd').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Akumulasi Angka Kredit',
                    'angkaKredit',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwKinerja: any) => {
                        this.router.navigate([
                            `/pak/pak-list/${this.nip}/${rwKinerja.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((rwKinerja: any, event: Event) => {
                        const isChecked = (event.target as HTMLInputElement)
                            .checked
                        if (isChecked) {
                            const exists = this.rwKinerjaList.some(
                                (item) => item.id === rwKinerja.id,
                            )
                            if (!exists) {
                                this.rwKinerjaList.push(rwKinerja)
                            }
                        } else {
                            const index = this.rwKinerjaList.findIndex(
                                (item) => item.id === rwKinerja.id,
                            )
                            if (index !== -1) {
                                this.rwKinerjaList.splice(index, 1)
                                console.log('Removed:', rwKinerja.id)
                            }
                        }

                        this.setRadarChartData()
                    }, 'info')
                    .setInputType('checkbox')
                    .setChecked((rwKinerja: any) => {
                        return this.rwKinerjaList.some(
                            (item) => item.id === rwKinerja.id,
                        )
                    })
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('nip')
                    .withDefaultValue(this.nip)
                    .build(),
            )
            .build()
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
