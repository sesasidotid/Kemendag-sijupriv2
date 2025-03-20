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
import { BehaviorSubject } from 'rxjs'
@Component({
    selector: 'app-ukom-task-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ukom-task-detail.component.html',
    styleUrl: './ukom-task-detail.component.scss'
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

    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private filePreviewService: FilePreviewService
    ) { }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.id = params['id']
        })
        this.getPendingTask()
    }

    getPendingTask() {
        this.apiService.getData(`/api/v1/pending_task/${this.id}`).subscribe({
            next: response => {
                this.pendingTask = new PendingTask(response)
                this.pesertaUkom = new PesertaUkom(this.pendingTask.objectTask.object)
                this.prevPendingTask = new PrevPendingTask(
                    this.pendingTask.objectTask.prevObject
                )

                this.findApproveDokumen(this.prevPendingTask.dokumenUkomList)
            },
            error: error => this.handlerService.handleException(error)
        })
    }

    findApproveDokumen(dokumenUkomList: any[]) {
        this.prevApprovedTask = dokumenUkomList.filter(
            dokumen => dokumen.dokumenStatus === 'APPROVE'
        )
        console.log('prevApprovedTask', this.prevApprovedTask)
    }

    preview(fileName: string, source: string) {
        this.filePreviewService.open(fileName, source)
    }

    isDocumentApproved(dokumenPersyaratanId: string): boolean {
        return this.prevApprovedTask.some(
            approvedDokumen =>
                approvedDokumen.dokumenPersyaratanId === dokumenPersyaratanId
        )
    }

    onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
        this.pesertaUkom.dokumenUkomList[index].status = status

        for (const formasiDokumen of this.pesertaUkom.dokumenUkomList) {
            if (formasiDokumen.status == 'REJECT') {
                this.isApproveEnable = false
                break
            }
            this.isApproveEnable = true
        }
    }

    back() {
        history.back()
    }

    sendSubmission() {
        console.log('body', this.body);

        this.apiService.postData(`/api/v1/participant_ukom/task/submit`, this.body)
            .subscribe({
                next: () => {
                    this.hadItemsLoading$.next(false);
                    this.handlerService.handleAlert('Success', 'Berhasil mengirimkan tugas');
                    this.handlerService.handleNavigate('/ukom/ukom-task-list');
                },
                error: error => {
                    this.hadItemsLoading$.next(false);
                    console.error(error);
                    this.handlerService.handleAlert('Error', 'Gagal mengirimkan tugas');
                }
            })
    }

    submitApprove() {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return;
                this.hadItemsLoading$.next(true);

                const task = new Task();
                task.id = this.pendingTask.id;
                task.remark = result.comment || null;
                task.taskAction = 'approve';

                this.body = {
                    id: this.pendingTask.id,
                    taskAction: task.taskAction
                };

                this.sendSubmission();
            }
        });
    }

    submitAmend() {
        this.confirmationService.open(true).subscribe({
            next: result => {
                if (!result.confirmed) return;
                this.hadItemsLoading$.next(true);

                const task = new Task();
                task.id = this.pendingTask.id;
                task.remark = result.comment || null;
                task.taskAction = 'amend';

                this.body = {
                    id: this.pendingTask.id,
                    taskAction: task.taskAction,
                    remark: task.remark
                };

                const rejectedDokumenUkomList = this.pesertaUkom.dokumenUkomList.filter(
                    dokumen => dokumen.status === 'REJECT'
                );

                if (rejectedDokumenUkomList.length > 0) {
                    this.body.object = { dokumenUkomList: rejectedDokumenUkomList };
                }

                this.sendSubmission();
            }
        });
    }

    submitReject() {
        this.confirmationService.open(true).subscribe({
            next: result => {
                if (!result.confirmed) return;
                this.hadItemsLoading$.next(true);

                const task = new Task();
                task.id = this.pendingTask.id;
                task.remark = result.comment || null;
                task.taskAction = 'reject';

                this.body = {
                    id: this.pendingTask.id,
                    taskAction: task.taskAction,
                    remark: task.remark
                };

                this.sendSubmission();
            }
        });
    }
}
