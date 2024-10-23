import { Component } from '@angular/core';
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model';
import { ApiService } from '../../../modules/base/services/api.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { PendingTask } from '../../../modules/workflow/models/pending-task.model';
import { ActivatedRoute } from '@angular/router';
import { Task } from '../../../modules/workflow/models/task.model';
import { CommonModule } from '@angular/common';
import { FilePreviewService } from '../../../modules/base/services/file-preview.service';

@Component({
  selector: 'app-ukom-task-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './ukom-task-detail.component.html',
  styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
  pesertaUkom: PesertaUkom;
  pendingTask: PendingTask;
  isApproveEnable: boolean = true;
  id: string;

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private filePreviewService: FilePreviewService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.id = params['id'];
    });
  }

  ngOnInit() {
    this.getPendingTask();
  }

  getPendingTask() {
    this.apiService.getData(`/api/v1/pending_task/${this.id}`).subscribe({
      next: (response) => {
        this.pendingTask = new PendingTask(response);
        this.pesertaUkom = new PesertaUkom(this.pendingTask.objectTask.object);
      },
      error: (error) => this.handlerService.handleException(error)
    })
  }

  preview(fileName: string, source: string) {
    this.filePreviewService.open(fileName, source);
  }

  onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
    this.pesertaUkom.dokumenPesertaUkom[index].status = status;

    for (const formasiDokumen of this.pesertaUkom.dokumenPesertaUkom) {
      if (formasiDokumen.status == 'REJECT') {
        this.isApproveEnable = false;
        break;
      }
      this.isApproveEnable = true;
    }
  }

  submit(isReject: boolean) {
    this.confirmationService.open(isReject).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        const task = new Task()
        task.id = this.pendingTask.id;
        task.remark = result.comment || null;
        task.taskAction = isReject ? 'reject' : 'approve';
        task.object = this.pesertaUkom;


        this.apiService.postData(`/api/v1/peserta_ukom/task/submit`, task).subscribe({
          next: () => this.handlerService.handleNavigate('/ukom/ukom-task-list'),
          error: (error) => this.handlerService.handleException(error)
        })
      },
    })
  }
}
