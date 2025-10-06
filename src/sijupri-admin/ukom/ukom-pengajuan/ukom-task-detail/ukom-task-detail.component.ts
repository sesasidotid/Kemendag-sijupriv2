import { UkomPendingTaskService } from './../../../../modules/ukom/services/ukom-pending-task.service'
import { Component, EventEmitter, Output } from '@angular/core'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { ActivatedRoute } from '@angular/router'
import { Task } from '../../../../modules/workflow/models/task.model'
import { CommonModule } from '@angular/common'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    combineLatest,
    finalize,
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
import {
    ParticipantObject,
    PendingTask,
    UkomFlowId,
} from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'

import { PrettyNamePipe } from '@/modules/base/pipes/pretty-name.pipe'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { PesertaUkom } from '@/modules/ukom/models/peserta-ukom.model'
@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [
        TanggalIndoPipe,
        CommonModule,
        FormsModule,
        LoadingButtonComponent,
        AgeCalculatorPipe,
        PrettyNamePipe,
    ],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss',
})
export class UkomTaskDetailComponent {
    public flowId = UkomFlowId
    @Output() pesertaUkomChange = new EventEmitter<ParticipantObject>()

    pesertaUkom: ParticipantObject
    pendingTask: PendingTask
    isApproveEnable: boolean = true
    body: Task
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

    tabIndex: number

    isPendingTaskLoading$ = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    pendingTaskDetail$ = this.ukomPendingTaskService.pendingTaskDetail$

    constructor(
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private filePreviewService: FilePreviewService,
        private router: Router,
        private ukomTaskService: UkomTaskService,
        public kinerjaService: KinerjaService,
        public jenisUkomService: JenisUkomService,
        public pendidikanService: PendidikanService,
        public ukomPendingTaskService: UkomPendingTaskService,
        private kabKotaService: KabKotaService,
    ) {
        this.isLoading$ = combineLatest([
            this.isPendingTaskLoading$,
            this.ukomPendingTaskService.isPendingTaskDetailLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        this.pendidikanService.fetchPendidikan()
        this.kinerjaService.fetchPredikatKinerja()
        this.activatedRoute.params.subscribe((params) => {
            this.ukomPendingTaskService.findById(params['id'])
        })

        this.pendingTaskDetail$.subscribe((pendingTask) => {
            if (pendingTask) {
                this.pendingTask = pendingTask
                this.pesertaUkom = pendingTask.objectTask.object
                this.pesertaUkomChange.emit(pendingTask.objectTask.object)
                this.pendingTask.objectTask.object.kabupatenKotaId &&
                    this.getKabupatenNameByCode(
                        this.pendingTask.objectTask.object.kabupatenKotaId,
                    )
                this.predikat1Name =
                    this.kinerjaService.getPredikatKinerjaNameById(
                        this.pendingTask.objectTask.object.predikatKinerja1Id,
                    )
                this.predikat2Name =
                    this.kinerjaService.getPredikatKinerjaNameById(
                        this.pendingTask.objectTask.object.predikatKinerja2Id,
                    )
                this.handlerTabIndex()
            }
        })
    }

    getKabupatenNameByCode(kabupatenCode: string) {
        this.kabKotaService
            .findById(kabupatenCode)
            .pipe(
                catchError(() => {
                    return of({ name: '-', type: '' })
                }),
            )
            .subscribe({
                next: (res) => {
                    this.kabupatenName = res.name
                    this.typeKabKota = res.type
                },
            })
    }

    handlerTabIndex() {
        if (this.pendingTask.flowId == UkomFlowId.UkomFlowId1) {
            this.tabIndex = 0
        }
        if (this.pendingTask.flowId == UkomFlowId.UkomFlowId2) {
            this.tabIndex = 1
        }
        if (this.pendingTask.taskStatus == 'FAILED') {
            this.tabIndex = 2
        }
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
        if (status === 'APPROVE') {
            this.pesertaUkom.dokumenUkomList[index].remark = ''
        }

        this.isApproveEnable = this.pesertaUkom.dokumenUkomList.every(
            (d) => d.dokumenStatus !== 'REJECT',
        )
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
                    taskAction: UkomFlowId.UkomFlowId4,
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
                    taskAction: UkomFlowId.UkomFlowId2,
                })

                const rejectedDokumenUkomList =
                    this.pesertaUkom.dokumenUkomList.filter(
                        (dokumen) => dokumen.dokumenStatus === 'REJECT',
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
                    taskAction: UkomFlowId.UkomFlowId3,
                    remark: comment || null,
                })

                const rejectedDokumenUkomList =
                    this.pesertaUkom.dokumenUkomList.filter(
                        (dokumen) => dokumen.dokumenStatus === 'REJECT',
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

    submitReset() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                this.hadItemsLoading$.next(true)

                this.body = new Task({
                    id: this.pendingTask.id,
                    taskAction: UkomFlowId.UkomFlowId1,
                })

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
