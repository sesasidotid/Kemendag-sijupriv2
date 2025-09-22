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
import { BehaviorSubject, finalize, tap } from 'rxjs'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { ConverterService } from '../../../modules/base/services/converter.service'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { UkomRevisionComponent } from '../ukom-revision/ukom-revision.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { TanggalIndoPipe } from '../../../modules/base/pipes/tanggal-indo.pipe'
import { SystemConfigService } from '@/modules/base/services/system-config.service'
import { AgeCalculatorPipe } from '@/modules/base/pipes/age-calculator.pipe'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
import { ProvinsiService } from '@/modules/maintenance/services/provinsi.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { BidangJabatanService } from '@/modules/maintenance/services/bidang-jabatan.service'
import { JfService } from '@/modules/siap/services/jf.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
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
        LoadingButtonComponent,
        AgeCalculatorPipe,
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
        public ukomTaskService: UkomTaskService,
        private converterService: ConverterService,
        private sanitizer: DomSanitizer,
        public systemConfigService: SystemConfigService,
        public jenisUkomService: JenisUkomService,
        public kinerjaService: KinerjaService,
        public pendidikanService: PendidikanService,
        public provinceService: ProvinsiService,
        public kabKotaService: KabKotaService,
        public bidangJabatanService: BidangJabatanService,
        private jfService: JfService,
        public ukomParticipantService: UkomParticipantService,
    ) {}

    ngOnInit() {
        this.systemConfigService.checkUkomRegistration()
        this.kinerjaService.fetchPredikatKinerja()
        this.pendidikanService.fetchPendidikan()
        this.getPendingTask()
        this.jfService.findByNip(LoginContext.getUserId()).subscribe({
            next: (response) => {
                this.jf = response
            },
        })
        this.ukomParticipantService.isJFCanRegisterUkom(
            LoginContext.getUserId(),
        )
    }

    openRegistrationForm(jenisUkom: string) {
        this.ukomTaskService.checkEligibility(
            jenisUkom,
            LoginContext.getUserId(),
        )
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

    getPendingTask() {
        this.ukomDataLoading$.next(true)
        this.ukomTaskService
            .findByNip(LoginContext.getUserId())
            .pipe(
                tap((res) => {
                    this.pendidikanName =
                        this.pendidikanService.getPendidikanById(
                            res.pendidikanTerakhirCode,
                        )?.name

                    res.provinsiId &&
                        this.provinceService
                            .findById(res.provinsiId)
                            .subscribe({
                                next: (provinsi) => {
                                    this.provinsiName = provinsi.name
                                },
                            })

                    res.kabupatenKotaId &&
                        this.kabKotaService
                            .findById(res.kabupatenKotaId)
                            .subscribe({
                                next: (kabKota) => {
                                    this.kabupatenName = kabKota.name
                                    this.typeKabKota = kabKota.type
                                },
                            })

                    res.bidangJabatanCode &&
                        this.bidangJabatanService
                            .findByCode(res.bidangJabatanCode)
                            .subscribe({
                                next: (bidangJabatan) => {
                                    this.bidangJabatanName = bidangJabatan.name
                                },
                            })

                    this.predikat1Name =
                        this.kinerjaService.getPredikatKinerjaNameById(
                            res.predikatKinerja1Id,
                        )
                    this.predikat2Name =
                        this.kinerjaService.getPredikatKinerjaNameById(
                            res.predikatKinerja2Id,
                        )
                }),
                finalize(() => {
                    this.ukomDataLoading$.next(false)
                }),
            )
            .subscribe({
                next: (response) => {
                    this.pendingTask = response
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
                    }
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
