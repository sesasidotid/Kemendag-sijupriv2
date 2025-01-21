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

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    private filePreviewService: FilePreviewService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.id = params['id']
    })
  }

  ngOnInit () {
    this.getPendingTask()
  }

  getPendingTask () {
    this.apiService.getData(`/api/v1/pending_task/${this.id}`).subscribe({
      next: response => {
        this.pendingTask = new PendingTask(response)
        this.pesertaUkom = new PesertaUkom(this.pendingTask.objectTask.object)
      },
      error: error => this.handlerService.handleException(error)
    })
  }

  preview (fileName: string, source: string) {
    this.filePreviewService.open(fileName, source)
  }

  onFIleSwitch (index: number, status: 'APPROVE' | 'REJECT') {
    this.pesertaUkom.dokumenUkomList[index].status = status

    for (const formasiDokumen of this.pesertaUkom.dokumenUkomList) {
      if (formasiDokumen.status == 'REJECT') {
        this.isApproveEnable = false
        break
      }
      this.isApproveEnable = true
    }
  }

  submit (isReject: boolean) {
    this.confirmationService.open(isReject).subscribe({
      next: result => {
        if (!result.confirmed) return

        const task = new Task()
        task.id = this.pendingTask.id
        task.remark = result.comment || null
        task.taskAction = isReject ? 'reject' : 'approve'

        this.body = {
          id: this.pendingTask.id,
          taskAction: task.taskAction
        }

        if (isReject) {
          const rejectedDokumenUkomList =
            this.pesertaUkom.dokumenUkomList.filter(
              dokumen => dokumen.status === 'REJECT'
            )

          if (rejectedDokumenUkomList.length > 0) {
            this.body.object = {
              dokumenUkomList: rejectedDokumenUkomList
            }
          }
        }

        console.log(this.pesertaUkom)
        // if (
        //   this.pendingTask.flowId !== 'ukom_flow_1' ||
        //   task.taskAction === 'reject'
        // ) {
        //   this.body.object = {
        //     dokumenUkomList: this.pesertaUkom.dokumenUkomList
        //   }
        // }
        // task.object = this.pesertaUkom

        // this.body = {
        //   id: this.pendingTask.id,
        //   taskAction: task.taskAction,
        //   object: {
        //     dokumenUkomList: this.pesertaUkom.dokumenUkomList
        //   }
        //   //   dokumen_ukom_list: this.pesertaUkom.dokumenUkomList
        // }

        console.log(this.body)

        this.apiService
          .postData(`/api/v1/participant_ukom/task/submit`, this.body)
          .subscribe({
            next: () =>
              this.handlerService.handleNavigate('/ukom/ukom-task-list'),
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }
}
