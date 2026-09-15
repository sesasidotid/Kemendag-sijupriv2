import { Component, HostListener, signal, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChartConfiguration, ChartOptions } from 'chart.js'
import { ApiService } from '../../modules/base/services/api.service'
import { BaseChartDirective, NgChartsModule } from 'ng2-charts'
import { FormsModule } from '@angular/forms'
import { Pagable } from '../../modules/base/commons/pagable/pagable'
import { Router } from '@angular/router'
import { BehaviorSubject, catchError, finalize, forkJoin, of } from 'rxjs'
import { LoginContext } from '../../modules/base/commons/login-context'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import { PendingTaskListModalComponent } from './pending-task-list-modal/pending-task-list-modal.component'

interface PendingCardConfig {
    key: keyof AdminDashboardComponent['pendingCounts']
    role: string
    title: string
    icon: string
    color: 'primary' | 'warning' | 'info' | 'success' | 'danger'
    route: string
}

interface UserStatConfig {
    key:
        | 'totalUserAdmin'
        | 'totalUserInstansi'
        | 'totalUserUnitKerja'
        | 'totalUserJF'
    title: string
    icon: string
    route: string
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        NgChartsModule,
        FormsModule,
        PendingTaskListModalComponent,
    ],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
    @ViewChild(BaseChartDirective) chart?: BaseChartDirective

    userRole: string[] = []
    pagable: Pagable
    pendingTaskList: PendingTask[]
    year: number = new Date().getFullYear()
    fromDate = this.toInputDate(this.subDays(new Date(), 6))
    toDate = this.toInputDate(new Date())
    rangeType: string = 'daily'
    activePreset: '7d' | 'month' | '3month' | 'year' | 'custom' = '7d'
    showFilterPopover = false
    selectedApplication: string = ''
    priorityPending: any[] = []
    showPendingTaskListModal = signal<boolean>(false)

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
                backgroundColor: 'rgba(54, 162, 235, 0.55)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1.5,
                borderRadius: 6,
                maxBarThickness: 48,
            },
        ],
    }

    barChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 10,
                cornerRadius: 8,
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: {
                beginAtZero: true,
                ticks: { precision: 0 },
                grid: { color: 'rgba(0,0,0,0.06)' },
            },
        },
    }

    // Konfigurasi kartu "pending" — tambah/ubah item di sini saja,
    // tidak perlu duplikasi blok HTML untuk tiap kartu.
    pendingCardConfigs: PendingCardConfig[] = [
        {
            key: 'akpVerifikasi',
            role: 'ADMIN_AKP',
            title: 'Verifikasi Pengajuan AKP',
            icon: 'mdi-file-check-outline',
            color: 'primary',
            route: '/akp/akp-task-list',
        },
        {
            key: 'akpPenilaianAtasan',
            role: 'ADMIN_AKP',
            title: 'Penilaian Atasan/Rekan Kerja AKP',
            icon: 'mdi-account-check-outline',
            color: 'info',
            route: '/akp/akp-task-list',
        },
        {
            key: 'akpPenilaianPribadi',
            role: 'ADMIN_AKP',
            title: 'Penilaian Pribadi AKP',
            icon: 'mdi-clipboard-account-outline',
            color: 'info',
            route: '/akp/akp-task-list',
        },
        {
            key: 'verifikasiUKom',
            role: 'ADMIN_UKOM',
            title: 'Verifikasi Pengajuan UKom',
            icon: 'mdi-certificate-outline',
            color: 'warning',
            route: '/ukom/ukom-task-list',
        },
        {
            key: 'perbaikanDokumenUKom',
            role: 'ADMIN_UKOM',
            title: 'Perbaikan Dokumen UKom',
            icon: 'mdi-file-edit-outline',
            color: 'warning',
            route: '/ukom/ukom-task-list',
        },
        {
            key: 'formasi',
            role: 'ADMIN_FORMASI',
            title: 'Formasi',
            icon: 'mdi-briefcase-outline',
            color: 'success',
            route: '/formasi/formasi-task-list',
        },
        {
            key: 'pak',
            role: 'ADMIN_PAK',
            title: 'PAK',
            icon: 'mdi-file-star-outline',
            color: 'danger',
            route: '/pak/pak-task-list',
        },
        {
            key: 'pengunduranDiriUKom',
            role: 'ADMIN_PAK',
            title: 'Pengunduran Diri',
            icon: 'mdi-file-star-outline',
            color: 'danger',
            route: '/pak/pak-task-list',
        },
    ]

    userStatConfigs: UserStatConfig[] = [
        {
            key: 'totalUserAdmin',
            title: 'Admin Sijupri',
            icon: 'mdi-account-key-outline',
            route: '/security/user',
        },
        {
            key: 'totalUserInstansi',
            title: 'Admin Instansi',
            icon: 'mdi-account-outline',
            route: '/siap/user-instansi',
        },
        {
            key: 'totalUserUnitKerja',
            title: 'Admin Unit Kerja',
            icon: 'mdi-account-supervisor-outline',
            route: '/siap/user-unit-kerja',
        },
        {
            key: 'totalUserJF',
            title: 'User JF',
            icon: 'mdi-account-group-outline',
            route: '/siap/user-jf',
        },
    ]

    totalUserJF: number = 0
    totalUserUnitKerja: number = 0
    totalUserAdmin: number = 0
    totalUserInstansi: number = 0

    totalNeedsVerification = 17

    getUrgencyClass(days: number): string {
        if (days >= 10) return 'badge--danger'
        if (days >= 5) return 'badge--warning'
        return 'badge--success'
    }

    pendingCounts = {
        akpVerifikasi: 0,
        akpPenilaianAtasan: 0,
        akpPenilaianPribadi: 0,
        formasi: 0,
        pak: 0,
        verifikasiUKom: 0,
        perbaikanDokumenUKom: 0,
        pengunduranDiriUKom: 0,
    }

    pendingLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )
    userLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
    chartLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )

    constructor(
        private apiService: ApiService,
        private router: Router,
    ) {
        this.userRole = LoginContext.getRoleCodes()
    }

    ngOnInit() {
        this.getPendingTaskList()
        this.fetchData()
        // this.getUserStats()
        this.getPendingCount()
    }

    hasRole(role: string): boolean {
        return this.userRole?.includes(role) || this.userRole?.includes('ADMIN')
    }

    get visiblePendingCards(): PendingCardConfig[] {
        return this.pendingCardConfigs.filter((c) => this.hasRole(c.role))
    }

    get totalPending(): number {
        return Object.values(this.pendingCounts).reduce((a, b) => a + b, 0)
    }

    getUserStatValue(key: UserStatConfig['key']): number {
        return this[key]
    }

    getPendingTaskList() {
        this.apiService
            .getData('/api/v1/pending_task/list?desc_date_created')
            .pipe(finalize(() => this.chartLoading$.next(false)))
            .subscribe({
                next: (res: any) => {
                    this.pendingTaskList = res.data || res
                    this.priorityPending = this.pendingTaskList.map(
                        (task: any) => ({
                            title: task.flowName,
                            applicant: task.objectGroup,
                            daysPending: this.calculateDaysPending(
                                task.dateCreated,
                            ),
                            icon: this.getTaskIcon(task.workflowName),
                            route: this.getTaskRoute(task),
                        }),
                    )
                },
                error: (err) => {
                    console.error('Error fetching data', err)
                },
            })
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
            totalPengunduranDiriUKom: this.apiService.getData(
                '/api/v1/ukom_resignation/task/search?page=1&limit=1',
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
                next: (result) => {
                    if (!result) return
                    const {
                        totalAKPVerifikasi,
                        totalAKPPenliaianAtasan,
                        totalAKPPenilaianPribadi,
                        totalFormasi,
                        totalPAK,
                        totalVerifikasiUKom,
                        totalPerbaikanDokumenUKom,
                        totalPengunduranDiriUKom,
                    } = result
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
                    this.pendingCounts.pengunduranDiriUKom =
                        totalPengunduranDiriUKom?.total ?? 0
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
            .pipe(
                finalize(() => this.userLoading$.next(false)),
                catchError((err) => {
                    console.error('Error fetching user stats', err)
                    return of(null)
                }),
            )
            .subscribe({
                next: (result) => {
                    if (!result) return
                    const {
                        totalUserJF,
                        totalUserUnitKerja,
                        totalUserAdmin,
                        totalUserInstansi,
                    } = result
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

    fetchData(from?: string, to?: string, selectedApplication?: string) {
        this.chartLoading$.next(true)

        let endpoint = '/api/v1/dashboard/participant_ukom_count'
        if (from && to) {
            endpoint += `?from=${from}&to=${to}&range_type=${this.rangeType}&application_type=${this.selectedApplication}`
        }

        this.apiService
            .getData(endpoint)
            .pipe(finalize(() => this.chartLoading$.next(false)))
            .subscribe({
                next: (res: any) => {
                    this.apiData = res.data || res
                    this.updateChartData()
                },
                error: (err) => {
                    console.error('Error fetching data', err)
                },
            })
    }

    updateChartData() {
        this.barChartData = {
            ...this.barChartData,
            labels: this.apiData.map((item: any) =>
                this.formatDateLabel(item.date),
            ),
            datasets: [
                {
                    ...this.barChartData.datasets[0],
                    data: this.apiData.map(
                        (item: any) => item.total ?? item.count ?? 0,
                    ),
                },
            ],
        }

        this.chart?.update()
    }

    private formatDateLabel(dateStr: string): string {
        if (!dateStr) return ''

        const parts = dateStr.split('-')

        // Mode Yearly ('2026')
        if (parts.length === 1) {
            return parts[0]
        }

        // Mode Monthly ('2026-07')
        if (parts.length === 2) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1)
            return new Intl.DateTimeFormat('id-ID', {
                month: 'long',
                year: 'numeric',
            }).format(date)
        }

        // Mode Daily/Weekly ('2026-07-17')
        if (parts.length === 3) {
            const date = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1,
                parseInt(parts[2]),
            )
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(date)
        }

        return dateStr
    }

    toggleFilterPopover(event: MouseEvent) {
        event.stopPropagation()
        this.showFilterPopover = !this.showFilterPopover
    }

    @HostListener('document:click')
    closeFilterPopover() {
        this.showFilterPopover = false
    }

    applyFilters() {
        if (!this.fromDate || !this.toDate) {
            return
        }

        if (this.fromDate > this.toDate) {
            ;[this.fromDate, this.toDate] = [this.toDate, this.fromDate]
        }

        this.activePreset = 'custom'
        this.fetchData(this.fromDate, this.toDate, this.selectedApplication)
    }

    applyPreset(preset: '7d' | 'month' | '3month' | 'year') {
        const now = new Date()
        this.activePreset = preset

        switch (preset) {
            case '7d':
                this.fromDate = this.toInputDate(this.subDays(now, 6))
                this.toDate = this.toInputDate(now)
                this.rangeType = 'daily'
                break
            case 'month':
                this.fromDate = this.toInputDate(
                    new Date(now.getFullYear(), now.getMonth(), 1),
                )
                this.toDate = this.toInputDate(
                    new Date(now.getFullYear(), now.getMonth() + 1, 0),
                )
                this.rangeType = 'monthly'
                break
            case '3month':
                this.fromDate = this.toInputDate(
                    new Date(now.getFullYear(), now.getMonth() - 2, 1),
                )
                this.toDate = this.toInputDate(
                    new Date(now.getFullYear(), now.getMonth() + 1, 0),
                )
                this.rangeType = 'monthly'
                break
            case 'year':
                this.fromDate = this.toInputDate(
                    new Date(now.getFullYear() - 1, now.getMonth() + 1, 1),
                )
                this.toDate = this.toInputDate(now)
                this.rangeType = 'yearly'
                break
        }

        this.applyFilters()
    }

    private subDays(date: Date, days: number): Date {
        const result = new Date(date)
        result.setDate(result.getDate() - days)
        return result
    }

    private toInputDate(date: Date): string {
        return date.toISOString().split('T')[0]
    }

    calculateDaysPending(dateCreated: string): number {
        const created = new Date(dateCreated)
        const now = new Date()

        const diffTime = now.getTime() - created.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        return Math.max(0, diffDays)
    }

    getTaskIcon(workflowName: string): string {
        switch (workflowName) {
            case 'participant_ukom_task':
                return 'mdi-account-check-outline' // peserta ukom — verifikasi kelayakan peserta
            case 'rw_kinerja_task':
                return 'mdi-user' // riwayat kinerja pegawai
            case 'akp_task':
                return 'mdi-chart-box-outline' // Analisis Kebutuhan Pegawai — analisis/data kebutuhan
            case 'formasi_task':
                return 'mdi-briefcase-outline' // pengajuan formasi jabatan
            case 'ukom_resignation_task':
                return 'mdi-account-remove-outline' // pengunduran diri peserta ukom
            default:
                return 'mdi-file-document-outline'
        }
    }

    getTaskRoute(task: PendingTask): string {
        switch (task.workflowName) {
            case 'participant_ukom_task':
                return `/ukom/ukom-task-list/${task.id}`
            case 'ukom_resignation_task':
                return `/ukom/ukom-resignation-list/${task.id}`
            case 'formasi_task':
                return `/formasi/formasi-task-list/${task.id}`
            case 'akp_task':
                return `/akp/akp-task-list/${task.id}`
            case 'rw_kinerja_task':
                return `/pak/pak-task-list/${task.objectGroup}`
            case 'formasi_task':
                return `/formasi/formasi-task-list/${task.id}`
            default:
                return '/akp/akp-task-list'
        }
    }

    openPendingTaskListModal() {
        this.showPendingTaskListModal.set(true)
    }

    closePendingTaskListModal() {
        this.showPendingTaskListModal.set(false)
    }
}
