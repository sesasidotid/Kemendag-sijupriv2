import { PredikatKinerjaService } from './../../../../modules/maintenance/services/predikat-kinerja.service'
import { Component } from '@angular/core'
import { PesertaUkom } from '../../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model'
import { ActivatedRoute } from '@angular/router'
import { Task } from '../../../../modules/workflow/models/task.model'
import { CommonModule } from '@angular/common'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'
import { PrevPendingTask } from '../../../../modules/workflow/models/prev-pending-task'
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    combineLatest,
    finalize,
    tap,
} from 'rxjs'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model'
import { TanggalIndoPipe } from '../../../../modules/base/pipes/tanggal-indo.pipe'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { UkomTaskService } from '../../../../modules/ukom/services/ukom-task.service'
import { LoadingButtonComponent } from '../../../../modules/base/components/loading-button/loading-button.component'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { AgeCalculatorPipe } from '@/modules/base/pipes/age-calculator.pipe'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [
        TanggalIndoPipe,
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        AgeCalculatorPipe,
    ],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss',
})
export class UkomTaskDetailComponent {
    pesertaUkom: PesertaUkom
    pendingTask: PendingTask
    isApproveEnable: boolean = true
    id: string
    body: any
    prevPendingTask: PrevPendingTask
    prevApprovedTask: any[] = []
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)
    kinerja2Tahun: RWKinerja[] = []

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string
    predikat1Name: string
    predikat2Name: string
    bidangJabatanName: string

    predikatKinerjaList: any[] = []

    tabIndex: number

    isPredikatKinerjaLoading$: BehaviorSubject<boolean> = new BehaviorSubject(
        false,
    )
    isPredikatKinerjaListLoading$: BehaviorSubject<boolean> =
        new BehaviorSubject(false)
    isPendingTaskLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private filePreviewService: FilePreviewService,
        private router: Router,
        private ukomTaskService: UkomTaskService,
        public kinerjaService: KinerjaService,
        public jenisUkomService: JenisUkomService,
        public pendidikanService: PendidikanService,
    ) {
        this.isLoading$ = combineLatest([
            this.isPredikatKinerjaLoading$,
            this.isPredikatKinerjaListLoading$,
            this.isPendingTaskLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        this.pendidikanService.fetchPendidikan()
        this.activatedRoute.params.subscribe((params) => {
            this.id = params['id']
            this.kinerjaService.fetchPredikatKinerja()
            this.getPendingTask()
        })
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

    loadPredikatKinerjaList() {
        this.isPredikatKinerjaListLoading$.next(true)
        this.apiService
            .getData('/api/v1/predikat_kinerja')
            .pipe(
                tap(() => {}),
                catchError((err) => {
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data predikat kinerja',
                    )
                    return of([])
                }),
                finalize(() => {
                    this.isPredikatKinerjaListLoading$.next(false)
                }),
            )
            .subscribe({
                next: (res) => {
                    this.predikatKinerjaList = res
                },
                error: (err) => {},
            })
    }

    transformInstansiName(value: string): string {
        if (!value) return null

        return value
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase())
    }

    getPendingTask() {
        this.isPendingTaskLoading$.next(true)

        this.apiService
            .getData(`/api/v1/pending_task/${this.id}`)
            .pipe(
                tap(() => {}),
                catchError((error) => {
                    this.isPendingTaskLoading$.next(false)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat data tugas',
                    )
                    return of(null)
                }),
                finalize(() => {
                    this.isPendingTaskLoading$.next(false)
                }),
            )
            .subscribe({
                next: (response) => {
                    this.pendingTask = new PendingTask(response)
                    this.pesertaUkom = new PesertaUkom(
                        this.pendingTask.objectTask.object,
                    )
                    this.prevPendingTask = new PrevPendingTask(
                        this.pendingTask.objectTask.prevObject,
                    )
                    this.pendidikanName =
                        this.pendidikanService.getPendidikanById(
                            this.pendingTask.objectTask.object
                                .pendidikanTerakhirCode,
                        ).name

                    if (this.pendingTask.objectTask.object.provinsiId) {
                        this.getProvinsiNameByCode(
                            this.pendingTask.objectTask.object.provinsiId,
                        )
                    }

                    if (this.pendingTask.objectTask.object.kabupatenKotaId) {
                        this.getKabupatenNameByCode(
                            this.pendingTask.objectTask.object.kabupatenKotaId,
                        )
                    }

                    if (this.pendingTask.objectTask.object.bidangJabatanCode) {
                        this.getBidangjabatanNameByCode(
                            this.pendingTask.objectTask.object
                                .bidangJabatanCode,
                        )
                    }

                    this.predikat1Name =
                        this.kinerjaService.getPredikatKinerjaNameById(
                            this.pendingTask.objectTask.object
                                .predikatKinerja1Id,
                        )
                    this.predikat2Name =
                        this.kinerjaService.getPredikatKinerjaNameById(
                            this.pendingTask.objectTask.object
                                .predikatKinerja2Id,
                        )

                    this.findApproveDokumen(
                        this.prevPendingTask.dokumenUkomList,
                    )
                    this.handlerTabIndex()
                },
            })
    }

    handlerTabIndex() {
        if (this.pendingTask.flowId == 'ukom_flow_1') {
            this.tabIndex = 0
        }
        if (this.pendingTask.flowId == 'ukom_flow_2') {
            this.tabIndex = 1
        }
        if (this.pendingTask.taskStatus == 'FAILED') {
            this.tabIndex = 2
        }
    }

    findApproveDokumen(dokumenUkomList: any[]) {
        this.prevApprovedTask = dokumenUkomList.filter(
            (dokumen) => dokumen.dokumenStatus === 'APPROVE',
        )
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    isDocumentApproved(dokumenPersyaratanId: string): boolean {
        return this.prevApprovedTask.some(
            (approvedDokumen) =>
                approvedDokumen.dokumenPersyaratanId === dokumenPersyaratanId,
        )
    }

    onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
        this.pesertaUkom.dokumenUkomList[index].status = status

        if (status == 'APPROVE') {
            this.pesertaUkom.dokumenUkomList[index].remark = ''
        }

        for (const formasiDokumen of this.pesertaUkom.dokumenUkomList) {
            if (formasiDokumen.status == 'REJECT') {
                this.isApproveEnable = false
                break
            }
            this.isApproveEnable = true
        }
    }

    back(tabIndex: number, menu: string) {
        this.router.navigate(['/ukom/ukom-task-list'], {
            state: { tabIndex: tabIndex, menu: menu },
        })
    }

    sendSubmission() {
        this.ukomTaskService
            .submitTask(this.body)
            .pipe(
                finalize(() => {
                    this.hadItemsLoading$.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleNavigate('/ukom/ukom-task-list')
                },
            })
    }

    submitApprove() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed, comment }) => {
                if (!confirmed) return
                this.hadItemsLoading$.next(true)

                this.body = new Task({
                    id: this.pendingTask.id,
                    remark: comment || null,
                    taskAction: 'approve',
                })

                this.sendSubmission()
            },
        })
    }

    submitAmend() {
        this.confirmationService.open(true).subscribe({
            next: ({ confirmed, comment }) => {
                if (!confirmed) return
                this.hadItemsLoading$.next(true)

                this.body = new Task({
                    id: this.pendingTask.id,
                    remark: comment || null,
                    taskAction: 'amend',
                })

                const rejectedDokumenUkomList =
                    this.pesertaUkom.dokumenUkomList.filter(
                        (dokumen) => dokumen.status === 'REJECT',
                    )

                if (rejectedDokumenUkomList.length > 0) {
                    this.body.object = {
                        dokumenUkomList: rejectedDokumenUkomList,
                    }
                }

                this.sendSubmission()
            },
        })
    }

    submitReject() {
        this.confirmationService.open(true).subscribe({
            next: ({ confirmed, comment }) => {
                if (!confirmed) return
                this.hadItemsLoading$.next(true)

                this.body = new Task({
                    id: this.pendingTask.id,
                    taskAction: 'reject',
                    remark: comment || null,
                })

                const rejectedDokumenUkomList =
                    this.pesertaUkom.dokumenUkomList.filter(
                        (dokumen) => dokumen.status === 'REJECT',
                    )

                if (rejectedDokumenUkomList.length > 0) {
                    this.body.object = {
                        dokumenUkomList: rejectedDokumenUkomList,
                    }
                }

                this.sendSubmission()
            },
        })
    }

    approveFailedTask() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.hadItemsLoading$.next(true)

                this.ukomTaskService
                    .approveFailedTask(this.pendingTask.id)
                    .pipe(
                        finalize(() => {
                            this.hadItemsLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.router.navigate(['/ukom/ukom-task-list'])
                        },
                    })
            },
        })
    }
}
