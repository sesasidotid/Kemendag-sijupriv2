import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { FilePreviewService } from '@/modules/base/services/file-preview.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { Component, EventEmitter, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, finalize, map, combineLatest, Observable } from 'rxjs'
import { CommonModule } from '@angular/common'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { TanggalIndoPipe } from '@/modules/base/pipes/tanggal-indo.pipe'
import {
    UkomResignationFlowId,
    UkomResignationPendingTask,
} from '@/modules/ukom/models/ukom-registration-refactored/resignation-pending-task.model'
import { ParticipantObject } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
import { Task } from '@/modules/workflow/models/task.model'
import { UkomTaskService } from '@/modules/ukom/services/ukom-task.service'
import { PrettyNamePipe } from '@/modules/base/pipes/pretty-name.pipe'
import { UkomResignationTaskService } from '@/modules/ukom/services/ukom-resignation-task.service'
import { ResignationDocument } from '@/modules/ukom/models/resignation/resignation-document.model '
import { FormsModule } from '@angular/forms'

@Component({
    selector: 'app-ukom-resignation-task-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LoadingButtonComponent,
        TanggalIndoPipe,
        TanggalIndoPipe,
        PrettyNamePipe,
    ],
    templateUrl: './ukom-resignation-task-detail.component.html',
    styleUrl: './ukom-resignation-task-detail.component.scss',
})
export class UkomResignationTaskDetailComponent {
    public flowId = UkomResignationFlowId
    @Output() pesertaUkomChange = new EventEmitter<ParticipantObject>()

    pesertaUkom: ParticipantObject
    ukomResignationDocument: string | null | undefined = undefined
    remarkDocument: string | null = undefined
    remarkDocumentStatus: string | 'APPROVE' | 'REJECT' = 'APPROVE'
    pendingTask: UkomResignationPendingTask
    isApproveEnable: boolean = true
    body: Task
    prevApprovedTask: any[] = []
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)

    pendidikanName: string
    provinsiName: string
    kabupatenName: string
    typeKabKota: string

    tabIndex: number

    isPendingTaskLoading$ = new BehaviorSubject(false)
    isLoading$: Observable<boolean>

    pendingTaskDetail$ =
        this.ukomResignationPendingTaskService.pendingTaskDetail$

    constructor(
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private filePreviewService: FilePreviewService,
        private router: Router,
        public jenisUkomService: JenisUkomService,
        public ukomResignationPendingTaskService: UkomResignationTaskService,
    ) {
        this.isLoading$ = combineLatest([
            this.isPendingTaskLoading$,
            this.ukomResignationPendingTaskService.isPendingTaskDetailLoading$,
        ]).pipe(map((loadings) => loadings.some((isLoading) => isLoading)))
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe((params) => {
            this.ukomResignationPendingTaskService.findById(params['id'])
        })

        this.pendingTaskDetail$.subscribe((pendingTask: any) => {
            if (pendingTask) {
                this.pendingTask = pendingTask
                this.pesertaUkom = pendingTask.objectTask.object
                this.ukomResignationDocument =
                    pendingTask.objectTask.object.suratPengunduranDiriUrl
                this.pesertaUkomChange.emit(pendingTask.objectTask.object)
                this.handlerTabIndex()
            }
        })
    }

    handlerTabIndex() {
        if (
            this.pendingTask.flowId ==
            UkomResignationFlowId.UkomResignationFlowId1
        ) {
            this.tabIndex = 0
        }
        if (
            this.pendingTask.flowId ==
            UkomResignationFlowId.UkomResignationFlowId1
        ) {
            this.tabIndex = 1
        }
        if (
            this.pendingTask.flowId ==
            UkomResignationFlowId.UkomResignationFlowId2
        ) {
            this.tabIndex = 2
        }
        if (this.pendingTask.taskStatus == 'FAILED') {
            this.tabIndex = 2
        }
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    onFIleSwitch(status: 'APPROVE' | 'REJECT') {
        this.remarkDocumentStatus = status
    }

    back(tabIndex: number, menu: string) {
        const eqFlowId = `resignation_flow_${tabIndex}`

        this.router.navigate(['/ukom/ukom-resignation-list'], {
            queryParams: {
                eq_flowId: eqFlowId,
                page: 1,
            },
        })
    }

    sendSubmission() {
        this.ukomResignationPendingTaskService
            .submitTask(this.body)
            .pipe(
                finalize(() => {
                    this.hadItemsLoading$.next(false)
                }),
            )
            .subscribe({
                next: () => {
                    this.handlerService.handleNavigate('/ukom/ukom-resignation-list')
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
                    taskAction: UkomResignationFlowId.UkomResignationApproved,
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
                    taskAction: UkomResignationFlowId.UkomResignationRevision,
                    object: {
                        remarkDocument: this.remarkDocument,
                        remarkDocumentStatus: this.remarkDocumentStatus,
                    },
                })

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
                    taskAction: UkomResignationFlowId.UkomResignationFlowId1,
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

                this.ukomResignationPendingTaskService
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
