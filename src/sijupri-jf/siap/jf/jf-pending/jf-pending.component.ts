import { Component } from '@angular/core';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { ApiService } from '../../../../modules/base/services/api.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { JenisKelamin } from '../../../../modules/maintenance/models/jenis-kelamin.model';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { JF } from '../../../../modules/siap/models/jf.model';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../../../modules/workflow/models/task.model';
import { HandlerService } from '../../../../modules/base/services/handler.service';

@Component({
  selector: 'app-jf-pending',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './jf-pending.component.html',
  styleUrl: './jf-pending.component.scss'
})
export class JfPendingComponent {
  jf: JF = new JF();
  jenisKelaminList: JenisKelamin[] = [];
  pendingTask: PendingTask;
  nip: string = LoginContext.getUserId();

  inputs: FIleHandler = {
    files: {},
    viewOnly: true,
    listen: (key: string, source: string, base64Data: string) => {
      this.jf.fileKtp = base64Data;
    }
  }

  ngOnInit() {
    this.getPendingTask();
    this.getJenisKelamin();
  }

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
  ) { }

  getPendingTask() {
    this.apiService.getData(`/api/v1/jf/expect_pending/${this.nip}`).subscribe({
      next: (response) => {
        this.pendingTask = new PendingTask(response);
        this.jf = new JF(this.pendingTask.objectTask.object);

        this.inputs.files['ktp'] = { label: "KTP", source: this.jf.ktpUrl };
        this.inputs.viewOnly = this.pendingTask.flowId == 'siap_flow_1'
      },
      error: (error) => {
        this.handlerService.handleException(error);
      }
    })
  }

  getJenisKelamin() {
    this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
      next: (response) => {
        this.jenisKelaminList = response.map((jenisKelamin: { [key: string]: any; }) => new JenisKelamin(jenisKelamin));
      },
      error: (error) => {
        this.handlerService.handleException(error);
      }
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;
        const task = new Task();
        task.id = this.pendingTask.id;
        task.taskAction = 'approve';
        task.object = this.jf;

        this.apiService.postData(`/api/v1/jf/task/submit`, task).subscribe({
          next: () => {
            this.handlerService.handleAlert('Success', "Berhasil");
            window.location.reload();
          }
        })
      }
    })
  }
}
