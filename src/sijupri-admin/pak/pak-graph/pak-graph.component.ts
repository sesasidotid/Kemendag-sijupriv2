import { Component } from '@angular/core'
import {
  Chart,
  RadialLinearScale,
  RadarController,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'app-pak-graph',
  standalone: true,
  imports: [],
  templateUrl: './pak-graph.component.html',
  styleUrl: './pak-graph.component.scss'
})
export class PakGraphComponent {
  rwKinerja: RWKinerja = new RWKinerja()
  rwKinerjaId: string

  constructor (private activatedRoute: ActivatedRoute) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.rwKinerjaId = params.get('rwKinerjaId')
    })
  }

  ngOnInit (): void {
    Chart.register(
      RadialLinearScale,
      RadarController,
      PointElement,
      LineElement,
      Filler,
      Tooltip,
      Legend
    )
    this.createRadarChart()
  }

  createRadarChart () {
    const ctx = document.getElementById('radarChart') as HTMLCanvasElement

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Label1', 'Label2', 'Label3', 'Label4'],
        datasets: [
          {
            label: 'Series A',
            data: [65, 59, 90, 81],
            fill: true,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            pointBackgroundColor: 'rgba(75,192,192,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(75,192,192,1)'
          },
          {
            label: 'Series B',
            data: [28, 48, 40, 19],
            fill: true,
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            pointBackgroundColor: 'rgba(255,99,132,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255,99,132,1)'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            angleLines: {
              display: false
            },
            suggestedMin: 50,
            suggestedMax: 100
          }
        }
      }
    })
  }
}
