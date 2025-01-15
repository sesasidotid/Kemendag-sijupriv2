import { Component } from '@angular/core'
import { JF } from '../../../modules/siap/models/jf.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { UkomTaskFormComponent } from '../ukom-task-form/ukom-task-form.component'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { Task } from '../../../modules/workflow/models/task.model'

@Component({
  selector: 'app-ukom-task',
  standalone: true,
  imports: [CommonModule, UkomTaskFormComponent, FileHandlerComponent],
  templateUrl: './ukom-task.component.html',
  styleUrl: './ukom-task.component.scss'
})
export class UkomTaskComponent {
  pendingTask: PendingTask
  pesertaUkom: PesertaUkom
  jf: JF = new JF()
  ukom: Ukom
  isFormOpen: boolean = false
  detectedDokumen: any = {}

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {}

  inputs: FIleHandler = {
    files: {},
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label
      }
    }
  }

  ngOnInit () {
    this.getPendingTask()
  }

  getPendingTask () {
    this.apiService
      .getData(
        `/api/v1/pending_task/wf_name/peserta_ukom_task/${LoginContext.getUserId()}`
      )
      .subscribe({
        next: response => {
          this.pendingTask = new PendingTask(response)
          this.pesertaUkom = new PesertaUkom(this.pendingTask.objectTask.object)

          this.detectedDokumen = {}
          const dokumenPersyaratanListTemp: any = []
          let count = 1
          this.pesertaUkom.dokumenPesertaUkom.forEach(dokumenPersyaratan => {
            if (dokumenPersyaratan.status == 'REJECT') {
              this.inputs.files['dokumenPersyaratan_' + count] = {
                label: dokumenPersyaratan.dokumenName,
                source: dokumenPersyaratan.dokumenUrl
              }
              count = count + 1
            } else {
              dokumenPersyaratanListTemp.push(dokumenPersyaratan)
            }
          })

          this.pesertaUkom.dokumenPesertaUkom = dokumenPersyaratanListTemp
        },
        error: error => {
          this.handlerService.handleException(error)
          this.getJF()
          this.getLatestUkom()
        }
      })
  }

  getJF () {
    this.apiService
      .getData(`/api/v1/jf/${LoginContext.getUserId()}`)
      .subscribe({
        next: response => (this.jf = new JF(response)),
        error: error => {
          this.handlerService.handleException(error)
        }
      })
  }

  getLatestUkom () {
    this.apiService.getData(`/api/v1/ukom/active`).subscribe({
      next: response => (this.ukom = new Ukom(response)),
      error: error => this.handlerService.handleException(error)
    })
  }

  submit () {
    for (const key in this.detectedDokumen) {
      this.pesertaUkom.dokumenPesertaUkom.push({
        file: this.detectedDokumen[key].base64,
        dokumenName: this.detectedDokumen[key].label
      })
    }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        const task = new Task()
        task.id = this.pendingTask.id
        task.taskAction = 'approve'
        task.object = this.pesertaUkom

        this.apiService
          .postData(`/api/v1/peserta_ukom/task/submit`, task)
          .subscribe({
            next: () => {},
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }
}
