import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChartConfiguration, ChartOptions } from 'chart.js'
import { ApiService } from '../../modules/base/services/api.service'
import { NgChartsModule } from 'ng2-charts'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { Observable, catchError, finalize, forkJoin, map, of } from 'rxjs'
import { LoginContext } from '../../modules/base/commons/login-context'

type RangeType = 'daily' | 'monthly' | 'yearly' | 'custom'

interface PendingItem {
    key: string
    label: string
    module: string
    route: string
    roles: string[]
    url: string
    total: number
}

interface PendingGroup {
    module: string
    icon: string
    color: string
    route: string
    items: PendingItem[]
}

interface ShareRow {
    code?: string
    name: string
    total: number
    color?: string
    kategori?: string
}

interface ApplicationSummary {
    workflowName: string
    label: string
    pending: number
    approve: number
    reject: number
    total: number
}

// palet kategorikal & status (urutan tetap, divalidasi untuk CVD)
const COLOR = {
    blue: '#2a78d6',
    blueSoft: 'rgba(42, 120, 214, 0.12)',
    orange: '#eb6834',
    aqua: '#1baf7a',
    yellow: '#eda100',
    violet: '#6250d6',
    good: '#0ca30c',
    warning: '#fab219',
    critical: '#d03b3b',
    grid: 'rgba(135, 138, 153, 0.15)',
    tick: '#878a99',
}

// ramp sekuensial (terang -> gelap) untuk data berurutan
const BLUE_RAMP = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab', '#104281']
const ORANGE_RAMP = ['#f7c3a9', '#f29a72', '#eb6834', '#c4511f']

const MODULE_META: Record<string, { icon: string; color: string }> = {
    AKP: { icon: 'mdi-clipboard-check-outline', color: COLOR.blue },
    UKom: { icon: 'mdi-file-certificate-outline', color: COLOR.orange },
    Formasi: { icon: 'mdi-sitemap-outline', color: COLOR.aqua },
    PAK: { icon: 'mdi-chart-box-outline', color: COLOR.yellow },
}

// tipe instansi daerah: wajib pilih provinsi dulu agar daftar instansi tidak terlalu besar
const REGIONAL_INSTANSI_TYPES = ['IT3', 'IT4', 'IT5']

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

const WORKFLOW_LABELS: Record<string, string> = {
    akp_task: 'AKP',
    participant_ukom_task: 'UKom',
    ukom_resignation_task: 'Pengunduran Diri UKom',
    formasi_task: 'Formasi',
    jf_task: 'Data JF',
    rw_kinerja_task: 'Kinerja / PAK',
    rw_pendidikan_task: 'Riwayat Pendidikan',
    rw_kompetensi_task: 'Riwayat Kompetensi',
    rw_pangkat_task: 'Riwayat Pangkat',
    rw_sertifikasi_task: 'Riwayat Sertifikasi',
    rw_jabatan_task: 'Riwayat Jabatan',
    user_task: 'User',
    role_task: 'Role',
}

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, NgChartsModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
    userRole: string[] = []
    userName: string = ''
    today = new Date()
    lastUpdated: Date | null = null

    // ===== Pengajuan pending =====
    pendingItems: PendingItem[] = [
        {
            key: 'akpVerifikasi',
            label: 'Verifikasi Pengajuan',
            module: 'AKP',
            route: '/akp/akp-task-list',
            roles: ['ADMIN_AKP'],
            url: '/api/v1/akp/task/search?page=1&limit=1&eq_flowId=akp_flow_1',
            total: 0,
        },
        {
            key: 'akpPenilaianAtasan',
            label: 'Penilaian Atasan / Rekan',
            module: 'AKP',
            route: '/akp/akp-task-list',
            roles: ['ADMIN_AKP'],
            url: '/api/v1/akp/task/search?page=1&limit=1&eq_flowId=akp_flow_2',
            total: 0,
        },
        {
            key: 'akpPenilaianPribadi',
            label: 'Penilaian Pribadi',
            module: 'AKP',
            route: '/akp/akp-task-list',
            roles: ['ADMIN_AKP'],
            url: '/api/v1/akp/task/search?page=1&limit=1&eq_flowId=akp_flow_3',
            total: 0,
        },
        {
            key: 'verifikasiUKom',
            label: 'Verifikasi Pengajuan',
            module: 'UKom',
            route: '/ukom/ukom-task-list',
            roles: ['ADMIN_UKOM'],
            url: '/api/v1/participant_ukom/task/search?page=1&limit=1&eq_flowId=ukom_flow_1',
            total: 0,
        },
        {
            key: 'perbaikanDokumenUKom',
            label: 'Perbaikan Dokumen',
            module: 'UKom',
            route: '/ukom/ukom-task-list',
            roles: ['ADMIN_UKOM'],
            url: '/api/v1/participant_ukom/task/search?page=1&limit=1&eq_flowId=ukom_flow_2',
            total: 0,
        },
        {
            key: 'formasi',
            label: 'Pengajuan Formasi',
            module: 'Formasi',
            route: '/formasi/formasi-task-list',
            roles: ['ADMIN_FORMASI'],
            url: '/api/v1/formasi/task/search?page=1&limit=1',
            total: 0,
        },
        {
            key: 'pak',
            label: 'Pengajuan Kinerja',
            module: 'PAK',
            route: '/pak/pak-task-list',
            roles: ['ADMIN_PAK'],
            url: '/api/v1/jf/task/kinerja/search?page=1&limit=1',
            total: 0,
        },
    ]
    visiblePendingItems: PendingItem[] = []
    pendingGroups: PendingGroup[] = []
    pendingLoading = false

    // ===== Tren & ringkasan pengajuan =====
    rangeOptions: { value: RangeType; label: string }[] = [
        { value: 'daily', label: '7 Hari' },
        { value: 'monthly', label: 'Bulan Ini' },
        { value: 'yearly', label: '12 Bulan' },
        { value: 'custom', label: 'Kustom' },
    ]
    applicationTypeOptions = [
        { value: '', label: 'Semua Layanan' },
        { value: 'akp_task', label: 'AKP' },
        { value: 'participant_ukom_task', label: 'UKom' },
        { value: 'formasi_task', label: 'Formasi' },
        { value: 'rw_kinerja_task', label: 'Kinerja / PAK' },
        { value: 'siap_task', label: 'Riwayat SIAP' },
        { value: 'jf_task', label: 'Data JF' },
    ]
    rangeType: RangeType = 'daily'
    applicationType = ''
    customFrom = this.toIsoDate(new Date(Date.now() - 29 * 86400000))
    customTo = this.toIsoDate(new Date())

    trendLoading = false
    trendGranularity = 'daily'
    trendTotal = 0
    trendAverage = 0
    trendPeak: { label: string; total: number } | null = null

    summaryLoading = false
    summaryRows: ApplicationSummary[] = []
    summaryTotals = { pending: 0, approve: 0, reject: 0, total: 0 }

    trendChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Pengajuan Masuk',
                borderColor: COLOR.blue,
                backgroundColor: COLOR.blueSoft,
                pointBackgroundColor: COLOR.blue,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
            },
        ],
    }
    trendChartOptions: ChartOptions<'line'> = this.baseOptions<'line'>({
        plugins: { legend: { display: false } },
    })

    // ===== Statistik UKom =====
    ukomLoading = false
    ukomPassRate = 0
    ukomTotalLulus = 0
    ukomTotalTidakLulus = 0
    ukomAverageAge = 0
    ukomParticipantTotal = 0

    ukomGradeChartData: ChartConfiguration<'bar'>['data'] = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Lulus',
                backgroundColor: COLOR.good,
                borderRadius: 4,
                borderSkipped: 'start',
                maxBarThickness: 28,
                stack: 'status',
            },
            {
                data: [],
                label: 'Tidak Lulus',
                backgroundColor: COLOR.critical,
                borderRadius: 4,
                borderSkipped: 'start',
                maxBarThickness: 28,
                stack: 'status',
            },
        ],
    }
    ukomGradeChartOptions: ChartOptions<'bar'> = this.baseOptions<'bar'>({
        scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: COLOR.tick } },
            y: {
                stacked: true,
                beginAtZero: true,
                grid: { color: COLOR.grid },
                border: { display: false },
                ticks: { color: COLOR.tick, precision: 0 },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: { usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 8, color: COLOR.tick },
            },
        },
    })

    ageRows: ShareRow[] = []
    ageChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] }
    ageChartOptions: ChartOptions<'doughnut'> = this.doughnutOptions()

    educationRows: ShareRow[] = []
    educationTotal = 0
    readonly educationTopCount = 5

    // ===== Statistik JF per instansi =====
    instansiTypeList: { code: string; name: string }[] = []
    provinsiList: { id: string; name: string }[] = []
    instansiList: { id: string; name: string }[] = []
    selectedInstansiType = ''
    selectedProvinsi = ''
    selectedInstansi = ''
    instansiLoading = false
    jfInstansiLoading = false
    jfInstansiTotal = 0
    jfUnitKerjaTotal = 0
    jfWithoutJabatan = 0
    jfGender: { name: string; total: number; color: string }[] = []

    jfJabatanRows: ShareRow[] = []
    selectedJfJabatan = ''
    jfJenjangLoading = false
    jfJenjangRows: ShareRow[] = []
    jfJenjangTotal = 0
    jfJenjangChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] }
    jfJenjangChartOptions: ChartOptions<'doughnut'> = this.doughnutOptions()

    constructor(
        private apiService: ApiService,
        private router: Router,
    ) {
        this.userRole = LoginContext.getRoleCodes() ?? []
        this.userName = LoginContext.getName() ?? ''
    }

    ngOnInit() {
        this.visiblePendingItems = this.pendingItems.filter((item) =>
            this.hasRole(...item.roles),
        )
        this.pendingGroups = this.buildPendingGroups()
        this.refreshAll()
    }

    get isSuperAdmin(): boolean {
        return this.userRole.includes('ADMIN')
    }

    get canSeeUkom(): boolean {
        return this.hasRole('ADMIN_UKOM')
    }

    get totalPending(): number {
        return this.visiblePendingItems.reduce((sum, item) => sum + item.total, 0)
    }

    get greeting(): string {
        const hour = new Date().getHours()
        if (hour < 11) return 'Selamat pagi'
        if (hour < 15) return 'Selamat siang'
        if (hour < 18) return 'Selamat sore'
        return 'Selamat malam'
    }

    groupTotal(group: PendingGroup): number {
        return group.items.reduce((sum, item) => sum + item.total, 0)
    }

    hasRole(...roles: string[]): boolean {
        return this.isSuperAdmin || roles.some((role) => this.userRole.includes(role))
    }

    refreshAll() {
        this.today = new Date()
        this.getPendingCount()
        if (this.isSuperAdmin) {
            this.loadApplicationStatistics()
            this.getInstansiTypeList()
        }
        if (this.canSeeUkom) {
            this.getUkomStatistics()
        }
        this.lastUpdated = new Date()
    }

    navigateTo(path: string) {
        this.router.navigate([path])
    }

    sharePercent(value: number, total: number): number {
        return total > 0 ? Math.round((value / total) * 100) : 0
    }

    // ===== Pengajuan pending =====
    getPendingCount() {
        if (this.visiblePendingItems.length === 0) return

        this.pendingLoading = true
        const requests: Record<string, Observable<number>> = {}
        this.visiblePendingItems.forEach((item) => {
            requests[item.key] = this.countOf(item.url)
        })

        forkJoin(requests)
            .pipe(finalize(() => (this.pendingLoading = false)))
            .subscribe((result) => {
                this.visiblePendingItems.forEach((item) => {
                    item.total = result[item.key] ?? 0
                })
            })
    }

    private buildPendingGroups(): PendingGroup[] {
        const groups = new Map<string, PendingGroup>()
        this.visiblePendingItems.forEach((item) => {
            if (!groups.has(item.module)) {
                const meta = MODULE_META[item.module]
                groups.set(item.module, {
                    module: item.module,
                    icon: meta?.icon ?? 'mdi-folder-outline',
                    color: meta?.color ?? COLOR.blue,
                    route: item.route,
                    items: [],
                })
            }
            groups.get(item.module)!.items.push(item)
        })
        return Array.from(groups.values())
    }

    // ===== Tren & ringkasan pengajuan =====
    setRange(range: RangeType) {
        this.rangeType = range
        if (range !== 'custom') this.loadApplicationStatistics()
    }

    applyCustomRange() {
        if (!this.customFrom || !this.customTo || this.customFrom > this.customTo) return
        this.loadApplicationStatistics()
    }

    onApplicationTypeChange() {
        this.getApplicationDistribution()
    }

    loadApplicationStatistics() {
        this.getApplicationDistribution()
        this.getApplicationSummary()
    }

    getApplicationDistribution() {
        this.trendLoading = true
        const query = this.buildRangeQuery()
        if (this.applicationType) {
            query.push(`applicationType=${this.applicationType}`)
        }

        this.apiService
            .getData(`/api/v1/dashboard/application-distribution?${query.join('&')}`)
            .pipe(
                catchError(() => of(null)),
                finalize(() => (this.trendLoading = false)),
            )
            .subscribe((res) => {
                const rows: { date: string; total: number }[] = res?.data ?? []
                this.trendGranularity = res?.granularity ?? 'daily'

                const labels = rows.map((row) => this.formatBucket(row.date, this.trendGranularity))
                const values = rows.map((row) => Number(row.total) || 0)

                this.trendTotal = values.reduce((a, b) => a + b, 0)
                this.trendAverage = values.length
                    ? Math.round((this.trendTotal / values.length) * 10) / 10
                    : 0

                const peakIndex = values.indexOf(Math.max(...values, 0))
                this.trendPeak =
                    this.trendTotal > 0 && peakIndex >= 0
                        ? { label: labels[peakIndex], total: values[peakIndex] }
                        : null

                this.trendChartData = {
                    ...this.trendChartData,
                    labels,
                    datasets: [{ ...this.trendChartData.datasets[0], data: values }],
                }
            })
    }

    getApplicationSummary() {
        this.summaryLoading = true
        this.apiService
            .getData(`/api/v1/dashboard/application-summary?${this.buildRangeQuery().join('&')}`)
            .pipe(
                catchError(() => of(null)),
                finalize(() => (this.summaryLoading = false)),
            )
            .subscribe((res) => {
                const rows: any[] = res?.data ?? []
                this.summaryRows = rows.map((row) => ({
                    workflowName: row.workflowName,
                    label: WORKFLOW_LABELS[row.workflowName] ?? row.workflowName,
                    pending: Number(row.pending) || 0,
                    approve: Number(row.approve) || 0,
                    reject: Number(row.reject) || 0,
                    total: Number(row.total) || 0,
                }))
                this.summaryTotals = this.summaryRows.reduce(
                    (acc, row) => ({
                        pending: acc.pending + row.pending,
                        approve: acc.approve + row.approve,
                        reject: acc.reject + row.reject,
                        total: acc.total + row.total,
                    }),
                    { pending: 0, approve: 0, reject: 0, total: 0 },
                )
            })
    }

    get rangeLabel(): string {
        switch (this.rangeType) {
            case 'daily':
                return '7 hari terakhir'
            case 'monthly':
                return 'bulan ini'
            case 'yearly':
                return '12 bulan terakhir'
            default:
                return `${this.formatDate(this.customFrom)} – ${this.formatDate(this.customTo)}`
        }
    }

    // ===== Statistik UKom =====
    getUkomStatistics() {
        this.ukomLoading = true
        forkJoin({
            grade: this.safeGet('/api/v1/dashboard/statistic/ukom-grade-status'),
            age: this.safeGet('/api/v1/dashboard/statistic/participant-ukom-age'),
            education: this.safeGet('/api/v1/dashboard/statistic/participant-ukom-education'),
        })
            .pipe(finalize(() => (this.ukomLoading = false)))
            .subscribe(({ grade, age, education }) => {
                const gradeRows: any[] = grade ?? []
                const lulus = gradeRows.map((row) => Number(row.lulus) || 0)
                const tidakLulus = gradeRows.map((row) => Number(row.tidakLulus) || 0)
                this.ukomTotalLulus = lulus.reduce((a, b) => a + b, 0)
                this.ukomTotalTidakLulus = tidakLulus.reduce((a, b) => a + b, 0)
                this.ukomPassRate = this.sharePercent(
                    this.ukomTotalLulus,
                    this.ukomTotalLulus + this.ukomTotalTidakLulus,
                )
                this.ukomGradeChartData = {
                    labels: gradeRows.map((row) => this.formatBucket(row.date, 'monthly')),
                    datasets: [
                        { ...this.ukomGradeChartData.datasets[0], data: lulus },
                        { ...this.ukomGradeChartData.datasets[1], data: tidakLulus },
                    ],
                }

                const ranges: any[] = age?.ranges ?? []
                this.ukomAverageAge = Number(age?.average) || 0
                this.ukomParticipantTotal = ranges.reduce(
                    (sum, row) => sum + (Number(row.total) || 0),
                    0,
                )
                this.ageRows = ranges.map((row, index) => ({
                    name: `${row.range} th`,
                    total: Number(row.total) || 0,
                    color: BLUE_RAMP[Math.min(index, BLUE_RAMP.length - 1)],
                }))
                this.ageChartData = this.toDoughnutData(this.ageRows)

                // urutkan dari terbanyak, sisanya setelah 5 teratas digabung ke "Lainnya"
                const educationRows: ShareRow[] = ((education as any[]) ?? [])
                    .map((row) => ({ name: row.pendidikanName, total: Number(row.total) || 0 }))
                    .filter((row) => row.total > 0)
                    .sort((a, b) => b.total - a.total)
                this.educationTotal = educationRows.reduce((sum, row) => sum + row.total, 0)
                const others = educationRows.slice(this.educationTopCount)
                this.educationRows = educationRows.slice(0, this.educationTopCount)
                if (others.length > 0) {
                    this.educationRows.push({
                        name: `Lainnya (${others.length} jenjang)`,
                        total: others.reduce((sum, row) => sum + row.total, 0),
                    })
                }
            })
    }

    get educationMax(): number {
        return Math.max(0, ...this.educationRows.map((row) => row.total))
    }

    // ===== Statistik JF per instansi =====
    getInstansiTypeList() {
        if (this.instansiTypeList.length > 0) {
            this.getJfInstansiStatistic()
            return
        }

        this.safeGet('/api/v1/instansi_type').subscribe((res) => {
            this.instansiTypeList = (res ?? []).map((item: any) => ({
                code: item.code,
                name: item.name,
            }))
            this.getJfInstansiStatistic()
        })
    }

    get isRegionalInstansiType(): boolean {
        return REGIONAL_INSTANSI_TYPES.includes(this.selectedInstansiType)
    }

    onInstansiTypeChange() {
        this.selectedProvinsi = ''
        this.selectedInstansi = ''
        this.instansiList = []
        this.getJfInstansiStatistic()

        if (!this.selectedInstansiType) return

        if (this.isRegionalInstansiType) {
            this.getProvinsiList()
            return
        }

        this.loadInstansiList(`/api/v1/instansi/type/${encodeURIComponent(this.selectedInstansiType)}`)
    }

    onProvinsiChange() {
        this.selectedInstansi = ''
        this.instansiList = []
        this.getJfInstansiStatistic()

        if (!this.selectedProvinsi) return

        this.loadInstansiList(`/api/v1/instansi/provinsi/${encodeURIComponent(this.selectedProvinsi)}`)
    }

    resetInstansiFilter() {
        this.selectedInstansiType = ''
        this.selectedProvinsi = ''
        this.selectedInstansi = ''
        this.instansiList = []
        this.getJfInstansiStatistic()
    }

    get selectedInstansiLabel(): string {
        if (this.selectedInstansi) {
            return this.instansiList.find((i) => i.id === this.selectedInstansi)?.name ?? ''
        }
        const type = this.instansiTypeList.find((t) => t.code === this.selectedInstansiType)
        const provinsi = this.provinsiList.find((p) => String(p.id) === String(this.selectedProvinsi))
        if (type && provinsi) {
            return `Semua instansi ${type.name} di ${provinsi.name}`
        }
        if (type) {
            return `Semua instansi ${type.name}`
        }
        return 'Semua instansi'
    }

    private getProvinsiList() {
        if (this.provinsiList.length > 0) return

        this.safeGet('/api/v1/provinsi').subscribe((res) => {
            this.provinsiList = ((res ?? []) as any[])
                .map((item) => ({ id: String(item.id), name: item.name }))
                .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
        })
    }

    private loadInstansiList(url: string) {
        const instansiType = this.selectedInstansiType

        this.instansiLoading = true
        this.safeGet(url)
            .pipe(finalize(() => (this.instansiLoading = false)))
            .subscribe((res) => {
                // endpoint per provinsi mengembalikan semua tipe, saring sesuai tipe terpilih
                this.instansiList = ((res ?? []) as any[])
                    .filter((item) => !item.instansiTypeCode || item.instansiTypeCode === instansiType)
                    .map((item) => ({ id: item.id, name: item.name }))
                    .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
            })
    }

    toggleJfJabatan(code: string | undefined) {
        if (!code) return
        this.selectedJfJabatan = this.selectedJfJabatan === code ? '' : code
        this.getJfInstansiStatistic(true)
    }

    get selectedJfJabatanName(): string {
        return this.jfJabatanRows.find((row) => row.code === this.selectedJfJabatan)?.name ?? ''
    }

    get jfJabatanMax(): number {
        return Math.max(0, ...this.jfJabatanRows.map((row) => row.total))
    }

    // jenjangOnly: hanya perbarui donut jenjang (dipakai saat memilih jabatan)
    getJfInstansiStatistic(jenjangOnly = false) {
        if (!jenjangOnly) this.selectedJfJabatan = ''

        const query: string[] = []
        if (this.selectedInstansiType) {
            query.push(`instansiTypeCode=${encodeURIComponent(this.selectedInstansiType)}`)
        }
        if (this.selectedProvinsi) {
            query.push(`provinsiId=${encodeURIComponent(this.selectedProvinsi)}`)
        }
        if (this.selectedInstansi) {
            query.push(`instansiId=${encodeURIComponent(this.selectedInstansi)}`)
        }
        if (this.selectedJfJabatan) {
            query.push(`jabatanCode=${encodeURIComponent(this.selectedJfJabatan)}`)
        }

        if (jenjangOnly) {
            this.jfJenjangLoading = true
        } else {
            this.jfInstansiLoading = true
        }
        this.safeGet(`/api/v1/dashboard/statistic/jf-by-instansi?${query.join('&')}`)
            .pipe(
                finalize(() => {
                    this.jfInstansiLoading = false
                    this.jfJenjangLoading = false
                }),
            )
            .subscribe((res) => {
                this.setJfJenjang(res?.byJenjang ?? [])
                if (jenjangOnly) return

                const byJabatan: any[] = res?.byJabatan ?? []
                const genderColors = [COLOR.blue, COLOR.orange, COLOR.tick]

                this.jfInstansiTotal = Number(res?.total) || 0
                this.jfUnitKerjaTotal = Number(res?.unitKerjaTotal) || 0
                this.jfGender = ((res?.byGender ?? []) as any[]).map((row, index) => ({
                    name: this.titleCase(row.name),
                    total: Number(row.total) || 0,
                    color: genderColors[Math.min(index, genderColors.length - 1)],
                }))

                const jabatanValues = byJabatan.map((row) => Number(row.total) || 0)
                this.jfWithoutJabatan = Math.max(
                    0,
                    this.jfInstansiTotal - jabatanValues.reduce((a, b) => a + b, 0),
                )

                this.jfJabatanRows = byJabatan.map((row) => ({
                    code: row.code,
                    name: row.name,
                    total: Number(row.total) || 0,
                }))
            })
    }

    private setJfJenjang(rows: any[]) {
        // keahlian = ramp biru, keterampilan = ramp oranye; makin tinggi jenjang makin gelap
        const counters: Record<string, number> = { keahlian: 0, keterampilan: 0 }
        this.jfJenjangRows = rows.map((row) => {
            const kategori = row.kategori === 'keterampilan' ? 'keterampilan' : 'keahlian'
            const ramp = kategori === 'keterampilan' ? ORANGE_RAMP : BLUE_RAMP
            const color = ramp[Math.min(counters[kategori]++, ramp.length - 1)]
            return { code: row.code, name: row.name, kategori, total: Number(row.total) || 0, color }
        })
        this.jfJenjangTotal = this.jfJenjangRows.reduce((sum, row) => sum + row.total, 0)
        this.jfJenjangChartData = this.toDoughnutData(this.jfJenjangRows)
    }

    jenjangKategoriTotal(kategori: string): number {
        return this.jfJenjangRows
            .filter((row) => row.kategori === kategori)
            .reduce((sum, row) => sum + row.total, 0)
    }

    // ===== Helpers =====
    private countOf(url: string): Observable<number> {
        return this.apiService.getData(url).pipe(
            map((res) => Number(res?.total) || 0),
            catchError(() => of(0)),
        )
    }

    private safeGet(url: string): Observable<any> {
        return this.apiService.getData(url).pipe(catchError(() => of(null)))
    }

    private buildRangeQuery(): string[] {
        if (this.rangeType === 'custom') {
            return [`from=${this.customFrom}`, `to=${this.customTo}`]
        }
        return [`rangeType=${this.rangeType}`]
    }

    private formatBucket(key: string, granularity: string): string {
        if (!key) return ''
        const [year, month, day] = key.split('-').map(Number)
        switch (granularity) {
            case 'daily':
                return `${day} ${MONTHS[month - 1]}`
            case 'weekly':
                return `Mg ${day} ${MONTHS[month - 1]}`
            case 'monthly':
                return `${MONTHS[month - 1]} ${String(year).slice(2)}`
            default:
                return String(year)
        }
    }

    private titleCase(value: string): string {
        return (value ?? '').replace(/\b\w/g, (char) => char.toUpperCase())
    }

    private formatDate(iso: string): string {
        const [year, month, day] = iso.split('-').map(Number)
        return `${day} ${MONTHS[month - 1]} ${year}`
    }

    private toIsoDate(date: Date): string {
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    private toDoughnutData(rows: ShareRow[]): ChartConfiguration<'doughnut'>['data'] {
        return {
            labels: rows.map((row) => row.name),
            datasets: [
                {
                    data: rows.map((row) => row.total),
                    backgroundColor: rows.map((row) => row.color ?? COLOR.blue),
                    hoverOffset: 6,
                    borderWidth: 0,
                    spacing: 2,
                },
            ],
        }
    }

    private doughnutOptions(): ChartOptions<'doughnut'> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            layout: { padding: 6 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(33, 37, 41, 0.92)',
                    padding: 10,
                    cornerRadius: 6,
                    boxPadding: 4,
                    usePointStyle: true,
                    callbacks: {
                        label: (ctx) => {
                            const values = ctx.dataset.data as number[]
                            const total = values.reduce((a, b) => a + b, 0)
                            return ` ${ctx.label}: ${ctx.parsed} (${this.sharePercent(ctx.parsed, total)}%)`
                        },
                    },
                },
            },
        }
    }

    private baseOptions<T extends 'bar' | 'line'>(overrides: any = {}): ChartOptions<T> {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            ...overrides,
            scales: overrides.scales ?? {
                x: { grid: { display: false }, ticks: { color: COLOR.tick, maxRotation: 0, autoSkip: true } },
                y: {
                    beginAtZero: true,
                    grid: { color: COLOR.grid },
                    border: { display: false },
                    ticks: { color: COLOR.tick, precision: 0 },
                },
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(33, 37, 41, 0.92)',
                    padding: 10,
                    cornerRadius: 6,
                    boxPadding: 4,
                    usePointStyle: true,
                },
                ...(overrides.plugins ?? {}),
            },
        } as ChartOptions<T>
    }
}
