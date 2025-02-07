import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChartConfiguration, ChartOptions } from 'chart.js'
import { ApiService } from '../../modules/base/services/api.service'
import { NgChartsModule, BaseChartDirective } from 'ng2-charts'
import { FormsModule } from '@angular/forms'
import { Pagable } from '../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../modules/base/components/pagable/pagable.component'

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule, FormsModule, PagableComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective

  pagable: Pagable
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

    this.pagable = new PagableBuilder(
      '/api/v1/participant_ukom/search?desc_lastUpdated=true&limit=10'
    )
      // this.pagable = new PagableBuilder('/api/v1/participant_ukom/search')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('NIP', 'nip').withSortable(false).build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama', 'name').withSortable(false).build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Update Terakhir', 'lastUpdated')
          .withSortable(false)
          .build()
      )
      //   .setLimit(5)
      .setEnablePagination(false)
      .build()
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
          //   this.apiData = [
          //     {
          //       month: 'March',
          //       year: '2024',
          //       count: 32
          //     },
          //     {
          //       month: 'April',
          //       year: '2024',
          //       count: 15
          //     },
          //     {
          //       month: 'May',
          //       year: '2024',
          //       count: 85
          //     },
          //     {
          //       month: 'June',
          //       year: '2024',
          //       count: 117
          //     },
          //     {
          //       month: 'July',
          //       year: '2024',
          //       count: 52
          //     },
          //     {
          //       month: 'August',
          //       year: '2024',
          //       count: 116
          //     },
          //     {
          //       month: 'September',
          //       year: '2024',
          //       count: 10
          //     },
          //     {
          //       month: 'October',
          //       year: '2024',
          //       count: 166
          //     },
          //     {
          //       month: 'November',
          //       year: '2024',
          //       count: 42
          //     },
          //     {
          //       month: 'December',
          //       year: '2024',
          //       count: 29
          //     },
          //     {
          //       month: 'January',
          //       year: '2025',
          //       count: 51
          //     },
          //     {
          //       month: 'February',
          //       year: '2025',
          //       count: 4
          //     }
          //   ]
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
