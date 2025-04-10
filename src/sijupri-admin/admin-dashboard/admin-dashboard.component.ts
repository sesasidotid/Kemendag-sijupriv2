import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChartConfiguration, ChartOptions } from 'chart.js'
import { ApiService } from '../../modules/base/services/api.service'
import { NgChartsModule, BaseChartDirective } from 'ng2-charts'
import { FormsModule } from '@angular/forms'
import { Pagable } from '../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import { forkJoin } from 'rxjs'
import { LoginContext } from '../../modules/base/commons/login-context'

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, NgChartsModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective

    userRole: string[] = []
    pagable: Pagable
    startMonth: number = 1
    endMonth: number = 12
    year: number = new Date().getFullYear()

    months = [
        { id: 'Januari', eng: 'January' },
        { id: 'Februari', eng: 'February' },
        { id: 'Maret', eng: 'March' },
        { id: 'April', eng: 'April' },
        { id: 'Mei', eng: 'May' },
        { id: 'Juni', eng: 'June' },
        { id: 'Juli', eng: 'July' },
        { id: 'Agustus', eng: 'August' },
        { id: 'September', eng: 'September' },
        { id: 'Oktober', eng: 'October' },
        { id: 'November', eng: 'November' },
        { id: 'Desember', eng: 'December' }
    ]

    apiData: any[] = []
    filteredData: any[] = []

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

    allMenuItems = [
        {
            role: 'ADMIN_AKP',
            label: 'AKP',
            route: '/akp/akp-task-list',
            count: 'totalAKPPending'
        },
        {
            role: 'ADMIN_UKOM',
            label: 'UKom',
            route: '/ukom/ukom-task-list',
            count: 'totalUKOMPending'
        },
        {
            role: 'ADMIN_FORMASI',
            label: 'FORMASI',
            route: '/formasi/formasi-task-list',
            count: 'totalFormasiPending'
        },
        {
            role: 'ADMIN_PAK',
            label: 'PAK',
            route: '/pak/pak-task-list',
            count: 'totalPAKPending'
        }
    ]

    totalAKPPending: number = 0
    totalUKOMPending: number = 0
    totalFormasiPending: number = 0
    totalSIAPPending: number = 0
    totalPAKPending: number = 0

    totalUserJF: number = 0
    totalUserUnitKerja: number = 0
    totalUserAdmin: number = 0
    totalUserInstansi: number = 0

    constructor(private apiService: ApiService, private router: Router) {
        this.userRole = LoginContext.getRoleCodes()
    }

    ngOnInit() {
        this.getTotalAKPPending()
        this.getTotalUKOMPending()
        this.getTotalFormasiPending()
        this.getTotalPAKPending()
        this.fetchData()
        this.getUserStats()
    }

    rounding(value: string): string {
        console.log(value)
        return parseFloat(value).toFixed(2)
    }

    getTotalAKPPending() {
        this.apiService.getData('/api/v1/akp/task/search').subscribe({
            next: res => {
                this.totalAKPPending = res.total
            }
        })
    }

    getTotalUKOMPending() {
        this.apiService.getData('/api/v1/participant_ukom/task/search').subscribe({
            next: res => {
                this.totalUKOMPending = res.total
            }
        })
    }

    getTotalFormasiPending() {
        this.apiService.getData('/api/v1/formasi/task/search').subscribe({
            next: res => {
                this.totalFormasiPending = res.total
            }
        })
    }

    getTotalPAKPending() {
        this.apiService.getData('/api/v1/jf/task/kinerja/search').subscribe({
            next: res => {
                this.totalPAKPending = res.total
            }
        })
    }

    getUserStats() {
        forkJoin({
            totalUserJF: this.apiService.getData('/api/v1/jf/search?page=1&limit=1'),
            totalUserUnitKerja: this.apiService.getData(
                '/api/v1/user_unit_kerja/search?page=1&limit=1'
            ),
            totalUserAdmin: this.apiService.getData(
                '/api/v1/user/search?eq_userApplicationChannel|applicationCode=sijupri-admin'
            ),
            totalUserInstansi: this.apiService.getData(
                '/api/v1/user_instansi/search?page=1&limit=1'
            )
        }).subscribe({
            next: ({
                totalUserJF,
                totalUserUnitKerja,
                totalUserAdmin,
                totalUserInstansi
            }) => {
                this.totalUserJF = totalUserJF.total
                this.totalUserUnitKerja = totalUserUnitKerja.total
                this.totalUserAdmin = totalUserAdmin.total
                this.totalUserInstansi = totalUserInstansi.total
            }
        })
    }

    navigateTo(path: string) {
        this.router.navigate([path])
    }

    fetchData() {
        this.apiService
            .getData('/api/v1/dashboard/participant_ukom_count')
            .subscribe({
                next: res => {
                    this.apiData = res
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
                    this.applyFilters()
                },
                error: err => {
                    console.error('Error fetching data', err)
                }
            })
    }

    applyFilters() {
        this.filteredData = this.apiData.filter((item: any) => {
            const monthObj = this.months.find(m => m.eng === item.month)
            const monthIndex = monthObj ? this.months.indexOf(monthObj) + 1 : 0
            return (
                monthIndex >= this.startMonth &&
                monthIndex <= this.endMonth &&
                item.year == this.year.toString()
            )
        })

        this.barChartData.labels = this.filteredData.map(item => {
            const monthObj = this.months.find(m => m.eng === item.month)
            return monthObj ? monthObj.id : item.month
        })
        this.barChartData.datasets[0].data = this.filteredData.map(
            item => item.count
        )

        this.chart?.update()
    }
}
