import { UkomTaskService } from '../../../modules/ukom/services/ukom-task.service'
import { Component } from '@angular/core'
import { JF } from '../../../modules/siap/models/jf.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { UkomTaskFormComponent } from '../ukom-task-form/ukom-task-form.component'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { BehaviorSubject } from 'rxjs'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { ConverterService } from '../../../modules/base/services/converter.service'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { UkomRevisionComponent } from '../ukom-revision/ukom-revision.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { TanggalIndoPipe } from '../../../modules/base/pipes/tanggal-indo.pipe'

export enum JenisUkomEnum {
    PERPINDAHAN_JABATAN = 'Perpindahan Jabatan',
    KENAIKAN_JENJANG = 'Kenaikan Jenjang',
    PROMOSI = 'Promosi',
    PROMOSI_JF = 'Promosi Jabatan Fungsional',
}

@Component({
    selector: 'app-ukom-task',
    standalone: true,
    imports: [
        CommonModule,
        UkomTaskFormComponent,
        EmptyStateComponent,
        ModalComponent,
        UkomRevisionComponent,
        TanggalIndoPipe,
    ],
    templateUrl: './ukom-task.component.html',
    styleUrl: './ukom-task.component.scss',
})
export class UkomTaskComponent {
    pendingTask: UkomTaskDetail = new UkomTaskDetail()
    pesertaUkom: PesertaUkom
    jf: JF = new JF()
    ukom: Ukom
    isFormOpen: boolean = false
    detectedDokumen: any = {}

    ukomDataLoading$ = new BehaviorSubject<boolean>(true)
    ukomStep$ = new BehaviorSubject<number>(1)
    currentUkomStep$ = new BehaviorSubject<number>(1)
    groupedUkomPendingTaskHistory: { [key: string]: any[] } = {}
    wannaRequest: boolean = false
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

    canRegister: boolean = true
    registerOpened$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false,
    )
    predikatKinerjaList: any[] = []

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    inputs: FIleHandler = {
        files: {},
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
        ) => {
            this.detectedDokumen[key] = {
                base64: base64Data,
                label: label,
            }
        },
    }

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private ukomTaskService: UkomTaskService,
        private converterService: ConverterService,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        this.checkStatusRegister()
        this.loadPredikatKinerja()
    }

    loadPredikatKinerja() {
        console.log('loadPredikatKinerja')
        this.apiService.getData('/api/v1/predikat_kinerja').subscribe({
            next: (res) => {
                this.predikatKinerjaList = res
                console.log('predikat kinerja:', this.predikatKinerjaList)
                this.getPendingTask()
                this.getJF()
                this.getJFRegisterStatus()
            },
            error: (err) => {
                console.error('Failed to fetch predikat kinerja:', err)
                this.getPendingTask()
                this.getJF()
                this.getJFRegisterStatus()
            },
        })
    }

    calculateAge(
        tanggalLahir: string | Date,
        tglSuratUsulan: string | Date,
    ): string {
        console.log('calculateAge', tanggalLahir, tglSuratUsulan)

        if (!tanggalLahir || !tglSuratUsulan) {
            return '-'
        }

        const birthDate = new Date(tanggalLahir)
        const suratDate = new Date(tglSuratUsulan)

        if (isNaN(birthDate.getTime()) || isNaN(suratDate.getTime())) {
            return '-'
        }

        let ageYears = suratDate.getFullYear() - birthDate.getFullYear()
        let ageMonths = suratDate.getMonth() - birthDate.getMonth()
        let ageDays = suratDate.getDate() - birthDate.getDate()

        if (ageMonths < 0 || (ageMonths === 0 && ageDays < 0)) {
            ageYears--
            ageMonths += 12
        }

        if (ageDays < 0) {
            const lastMonth = new Date(
                suratDate.getFullYear(),
                suratDate.getMonth(),
                0,
            )
            ageDays += lastMonth.getDate()
            ageMonths--
        }

        return `${ageYears} Tahun ${ageMonths} Bulan ${ageDays} Hari`
    }

    getJenisUkomLabel(jenisUkom: string): string {
        return JenisUkomEnum[jenisUkom as keyof typeof JenisUkomEnum] || '-'
    }

    checkStatusRegister() {
        this.apiService.getData(`/api/v1/sys_conf/UKM_REGISTRATION`).subscribe({
            next: (response) => {
                this.registerOpened$.next(response.value == 'ya')
            },
        })
    }

    isAnyFieldEmpty(): boolean {
        return (
            !this.jf?.name ||
            !this.jf?.phone ||
            !this.jf?.email ||
            !this.jf?.tempatLahir ||
            !this.jf?.tanggalLahir ||
            !this.jf?.jenisKelaminName ||
            !this.jf?.nik ||
            !this.jf?.jabatanName ||
            !this.jf?.jenjangName ||
            !this.jf?.pangkatName
        )
    }

    fetchPhotoProfile() {
        this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
            next: (blob) => {
                if (blob.size === 0) {
                    this.profileImageSrc = 'assets/no-profile.jpg'
                    return
                }
                const objectUrl = URL.createObjectURL(blob)
                this.profileImageSrc =
                    this.sanitizer.bypassSecurityTrustUrl(objectUrl)
            },
            error: (err) => {
                console.error('Error fetching profile image', err)
                this.profileImageSrc = 'assets/no-profile.jpg'
            },
        })
    }

    getJFRegisterStatus() {
        this.apiService
            .getData(
                `/api/v1/participant_ukom/latest/${LoginContext.getUserId()}`,
            )
            .subscribe({
                next: (response) => {
                    if (response.id) {
                        this.canRegister = false
                    }
                },
                error: (error) => {
                    if (error.error.code == 'RCD-00001') {
                        this.canRegister = true
                        return
                    }
                },
            })
    }

    getPendidikanList(pendidikanTerakhirCode: string) {
        this.apiService.getData(`/api/v1/pendidikan`).subscribe({
            next: (response) => {
                const matchedPendidikan = response.find(
                    (pendidikan: any) =>
                        pendidikan.code === pendidikanTerakhirCode,
                )
                this.pendidikanName = matchedPendidikan
                    ? matchedPendidikan.name
                    : null
            },
        })
    }

    getProvinsiNameByCode(provinsiCode: string) {
        this.apiService.getData(`/api/v1/provinsi/${provinsiCode}`).subscribe({
            next: (response) => {
                this.provinsiName = response.name ?? null
            },
        })
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        this.apiService.getData(`/api/v1/kab_kota/${kabupatenCode}`).subscribe({
            next: (response) => {
                this.kabupatenName = response.name ?? null
                this.typeKabKota = response.type ?? null
            },
        })
    }

    getPredikatKinerja(code: string | null): string {
        console.log('getPredikatKinerja', code)
        if (!code || code == null) return '-'
        const predikat = this.predikatKinerjaList.find(
            (predikat) => predikat.id === code,
        )
        return predikat ? predikat.name : '-'
    }

    getBidangjabatanNameByCode(bidangJabatanCode: string) {
        this.apiService
            .getData(`/api/v1/bidang_jabatan/${bidangJabatanCode}`)
            .subscribe({
                next: (response) => {
                    this.bidangJabatanName = response.name ?? null
                },
            })
    }

    getPendingTask() {
        this.ukomDataLoading$.next(true)
        this.ukomTaskService.findByNip(LoginContext.getUserId()).subscribe({
            next: (response) => {
                this.pendingTask = response
                console.log('p', response)

                this.getPendidikanList(response.pendidikanTerakhirCode)
                if (response.provinsiId) {
                    this.getProvinsiNameByCode(response.provinsiId)
                }

                if (response.kabupatenKotaId) {
                    this.getKabupatenNameByCode(response.kabupatenKotaId)
                }

                if (response.bidangJabatanCode) {
                    this.getBidangjabatanNameByCode(response.bidangJabatanCode)
                }

                this.predikat1Name = this.getPredikatKinerja(
                    response.predikatKinerja1Id,
                )
                this.predikat2Name = this.getPredikatKinerja(
                    response.predikatKinerja2Id,
                )

                switch (this.pendingTask.flowId) {
                    case 'ukom_flow_1':
                        this.ukomStep$.next(1)
                        this.currentUkomStep$.next(1)
                        break
                    case 'ukom_flow_2':
                        this.ukomStep$.next(2)
                        this.currentUkomStep$.next(2)
                        break
                    default:
                        break
                }

                if (this.pendingTask.pendingTaskHistory.length > 0) {
                    this.groupedUkomPendingTaskHistory =
                        this.groupAndSortTasksByFlowId(
                            this.pendingTask.pendingTaskHistory,
                        )
                    console.log(
                        'groupedUkomPendingTaskHistory',
                        this.groupedUkomPendingTaskHistory,
                    )
                }

                this.ukomDataLoading$.next(false)
            },
            error: (error) => {
                this.ukomDataLoading$.next(false)
                this.getJF()
            },
        })
    }

    getJF() {
        this.apiService
            .getData(`/api/v1/jf/${LoginContext.getUserId()}`)
            .subscribe({
                next: (response) => (this.jf = new JF(response)),
                error: (error) => {
                    this.handlerService.handleException(error)
                },
            })
    }

    getLatestUkom() {
        this.apiService
            .getData(
                `/api/v1/participant_ukom/task/nip/${LoginContext.getUserId()}`,
            )
            .subscribe({
                next: (response) => (this.ukom = new Ukom(response)),
                error: (error) => console.log('error', error),
            })
    }

    handleStepClick(clickedStep: number) {
        this.currentUkomStep$.subscribe((step) => {
            if (clickedStep <= step) {
                this.ukomStep$.next(clickedStep)
            }
        })
    }

    groupAndSortTasksByFlowId(tasks: any[]): { [key: string]: any[] } {
        const grouped = tasks.reduce(
            (acc, task) => {
                if (!acc[task.flowId]) {
                    acc[task.flowId] = []
                }
                acc[task.flowId].push(task)
                return acc
            },
            {} as { [key: string]: any[] },
        )

        Object.keys(grouped).forEach((flowId) => {
            grouped[flowId].sort((a: any, b: any) => {
                const dateA = new Date(a.lastUpdated).getTime()
                const dateB = new Date(b.lastUpdated).getTime()
                return dateA - dateB // Sort in descending order
            })
        })

        return grouped
    }

    reqChange() {
        this.wannaRequest = !this.wannaRequest
    }

    convertDate(date: string) {
        return this.converterService.dateToHumanReadable(date)
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    ngOnDestroy() {
        this.ukomDataLoading$.unsubscribe()
        this.ukomStep$.unsubscribe()
        this.currentUkomStep$.unsubscribe()
    }
}
