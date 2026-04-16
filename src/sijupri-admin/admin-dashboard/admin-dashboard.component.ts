import { Component, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChartConfiguration, ChartOptions } from 'chart.js'
import { ApiService } from '../../modules/base/services/api.service'
import { BaseChartDirective, NgChartsModule } from 'ng2-charts'
import { FormsModule } from '@angular/forms'
import { Pagable } from '../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import { BehaviorSubject, catchError, finalize, forkJoin, of } from 'rxjs'
import { LoginContext } from '../../modules/base/commons/login-context'

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, NgChartsModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
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
        { id: 'Desember', eng: 'December' },
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
                borderWidth: 1,
            },
        ],
    }

    barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {},
            y: { beginAtZero: true },
        },
    }

    allMenuItems = [
        {
            role: 'ADMIN_AKP',
            label: 'AKP',
            route: '/akp/akp-task-list',
            count: 'totalAKPPending',
        },
        {
            role: 'ADMIN_UKOM',
            label: 'UKom',
            route: '/ukom/ukom-task-list',
            count: 'totalUKOMPending',
        },
        {
            role: 'ADMIN_FORMASI',
            label: 'FORMASI',
            route: '/formasi/formasi-task-list',
            count: 'totalFormasiPending',
        },
        {
            role: 'ADMIN_PAK',
            label: 'PAK',
            route: '/pak/pak-task-list',
            count: 'totalPAKPending',
        },
    ]

    totalUserJF: number = 0
    totalUserUnitKerja: number = 0
    totalUserAdmin: number = 0
    totalUserInstansi: number = 0

    pendingCounts = {
        akpVerifikasi: 0,
        akpPenilaianAtasan: 0,
        akpPenilaianPribadi: 0,
        formasi: 0,
        pak: 0,
        verifikasiUKom: 0,
        perbaikanDokumenUKom: 0,
    }

    pendingLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )
    userLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    constructor(
        private apiService: ApiService,
        private router: Router,
    ) {
        this.userRole = LoginContext.getRoleCodes()
    }

    ngOnInit() {
        this.fetchData()
        this.getUserStats()
        this.getPendingCount()
    }

    getPendingCount() {
        this.pendingLoading$.next(true)
        forkJoin({
            totalAKPVerifikasi: this.apiService.getData(
                '/api/v1/akp/task/search?page=1&limit=1&eq_flowId=akp_flow_1',
            ),
            totalAKPPenliaianAtasan: this.apiService.getData(
                '/api/v1/akp/task/search?page=1&limit=1&eq_flowId=akp_flow_2',
            ),
            totalAKPPenilaianPribadi: this.apiService.getData(
                '/api/v1/akp/task/search?page=1&limit=1&eq_flowId=akp_flow_3',
            ),
            totalFormasi: this.apiService.getData(
                '/api/v1/formasi/task/search?page=1&limit=1',
            ),
            totalPAK: this.apiService.getData(
                '/api/v1/jf/task/kinerja/search?page=1&limit=1',
            ),
            totalVerifikasiUKom: this.apiService.getData(
                '/api/v1/participant_ukom/task/search?page=1&limit=1&eq_flowId=ukom_flow_1',
            ),
            totalPerbaikanDokumenUKom: this.apiService.getData(
                '/api/v1/participant_ukom/task/search?page=1&limit=1&eq_flowId=ukom_flow_2',
            ),
        })
            .pipe(
                finalize(() => {
                    this.pendingLoading$.next(false)
                }),
                catchError((err) => {
                    console.error('Error fetching pending counts', err)
                    this.pendingLoading$.next(false)
                    return of(null)
                }),
            )
            .subscribe({
                next: ({
                    totalAKPVerifikasi,
                    totalAKPPenliaianAtasan,
                    totalAKPPenilaianPribadi,
                    totalFormasi,
                    totalPAK,
                    totalVerifikasiUKom,
                    totalPerbaikanDokumenUKom,
                }) => {
                    this.pendingCounts.akpVerifikasi =
                        totalAKPVerifikasi.total ?? 0
                    this.pendingCounts.akpPenilaianAtasan =
                        totalAKPPenliaianAtasan.total ?? 0
                    this.pendingCounts.akpPenilaianPribadi =
                        totalAKPPenilaianPribadi.total ?? 0
                    this.pendingCounts.formasi = totalFormasi.total ?? 0
                    this.pendingCounts.pak = totalPAK.total ?? 0
                    this.pendingCounts.verifikasiUKom =
                        totalVerifikasiUKom.total ?? 0
                    this.pendingCounts.perbaikanDokumenUKom =
                        totalPerbaikanDokumenUKom.total ?? 0
                },
            })
    }

    getUserStats() {
        this.userLoading$.next(true)
        forkJoin({
            totalUserJF: this.apiService.getData(
                '/api/v1/jf/search?page=1&limit=1',
            ),
            totalUserUnitKerja: this.apiService.getData(
                '/api/v1/user_unit_kerja/search?page=1&limit=1',
            ),
            totalUserAdmin: this.apiService.getData(
                '/api/v1/user/search?page=1&limit=10&eq_userApplicationChannel|applicationCode=sijupri-admin&eq_userApplicationChannel|channelCode=WEB',
            ),
            totalUserInstansi: this.apiService.getData(
                '/api/v1/user_instansi/search?page=1&limit=1',
            ),
        })
            .pipe(finalize(() => this.userLoading$.next(false)))
            .subscribe({
                next: ({
                    totalUserJF,
                    totalUserUnitKerja,
                    totalUserAdmin,
                    totalUserInstansi,
                }) => {
                    this.totalUserJF = totalUserJF.total
                    this.totalUserUnitKerja = totalUserUnitKerja.total
                    this.totalUserAdmin = totalUserAdmin.total
                    this.totalUserInstansi = totalUserInstansi.total
                },
            })
    }

    navigateTo(path: string) {
        this.router.navigate([path])
    }

    fetchData() {
        this.apiService
            .getData('/api/v1/dashboard/participant_ukom_count')
            .subscribe({
                next: (res) => {
                    this.apiData = res
                    this.applyFilters()
                },
                error: (err) => {
                    console.error('Error fetching data', err)
                },
            })
    }

    applyFilters() {
        this.filteredData = this.apiData.filter((item: any) => {
            const monthObj = this.months.find((m) => m.eng === item.month)
            const monthIndex = monthObj ? this.months.indexOf(monthObj) + 1 : 0
            return (
                monthIndex >= this.startMonth &&
                monthIndex <= this.endMonth &&
                item.year == this.year.toString()
            )
        })

        this.barChartData.labels = this.filteredData.map((item) => {
            const monthObj = this.months.find((m) => m.eng === item.month)
            return monthObj ? monthObj.id : item.month
        })
        this.barChartData.datasets[0].data = this.filteredData.map(
            (item) => item.count,
        )

        this.chart?.update()
    }
}
