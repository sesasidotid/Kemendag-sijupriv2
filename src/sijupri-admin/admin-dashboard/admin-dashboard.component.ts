import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChartConfiguration, ChartOptions } from 'chart.js'
import { ApiService } from '../../modules/base/services/api.service'
import { NgChartsModule, BaseChartDirective } from 'ng2-charts'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective

  startMonth: number = 1
  endMonth: number = 12
  year: number = new Date().getFullYear()

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  apiData: any[] = [] // Store full API response
  filteredData: any[] = [] // Store filtered data

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Jumlah Peserta UKom',
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  }

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: { beginAtZero: true }
    }
  }

  totalAKPPending: number = 0
  totalUKOMPending: number = 0
  totalFormasiPending: number = 0
  totalSIAPPending: number = 0

  constructor (private apiService: ApiService) {
    this.getTotalAKPPending()
    this.getTotalUKOMPending()
    this.getTotalFormasiPending()
  }

  getTotalAKPPending () {
    this.apiService.getData('/api/v1/akp/task/search?p').subscribe({
      next: res => {
        this.totalAKPPending = res.total
      }
    })
  }

  getTotalUKOMPending () {
    this.apiService.getData('/api/v1/participant_ukom/task/search').subscribe({
      next: res => {
        this.totalUKOMPending = res.total
      }
    })
  }

  getTotalFormasiPending () {
    this.apiService.getData('/api/v1/formasi/task/search').subscribe({
      next: res => {
        this.totalFormasiPending = res.total
      }
    })
  }

  ngOnInit () {
    this.fetchData()
  }

  fetchData () {
    this.apiService
      .getData('/api/v1/dashboard/participant_ukom_count')
      .subscribe({
        next: res => {
          this.apiData = res // Store raw API response
          this.applyFilters() // Apply frontend filtering
        },
        error: err => {
          console.error('Error fetching data', err)
        }
      })
  }

  applyFilters () {
    this.filteredData = this.apiData.filter((item: any) => {
      const monthIndex = this.months.indexOf(item.month) + 1
      return (
        monthIndex >= this.startMonth &&
        monthIndex <= this.endMonth &&
        item.year == this.year.toString()
      )
    })

    // Update chart data
    this.barChartData.labels = this.filteredData.map(item => item.month)
    this.barChartData.datasets[0].data = this.filteredData.map(
      item => item.count
    )

    this.chart?.update()
  }
}
