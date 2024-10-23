import { Component } from '@angular/core';
import { PendingTask } from '../../../modules/workflow/models/pending-task.model';
import { FormasiDokumenComponent } from './formasi-dokumen/formasi-dokumen.component';
import { LoginContext } from '../../../modules/base/commons/login-context';
import { CommonModule } from '@angular/common';
import { FormasiRequestComponent } from './formasi-request/formasi-request.component';
import { ObjectTask } from '../../../modules/workflow/models/object-task.model';
import { Task } from '../../../modules/workflow/models/task.model';
import { ApiService } from '../../../modules/base/services/api.service';
import { take } from 'rxjs';
import { AlertService } from '../../../modules/base/services/alert.service';
import { FormasiDokumen } from '../../../modules/formasi/models/formasi-dokumen.model';
import { FormasiRequest } from '../../../modules/formasi/models/formasi-request.model';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';

@Component({
  selector: 'app-formasi-task',
  standalone: true,
  imports: [
    CommonModule,
    FormasiDokumenComponent,
    FormasiRequestComponent,
    FormsModule
  ],
  templateUrl: './formasi-task.component.html',
  styleUrl: './formasi-task.component.scss'
})
export class FormasiTaskComponent {
  pendingTask: PendingTask = null;
  objectTask: ObjectTask = null;
  isRequestPage: boolean = false;
  formasiDokumenList: FormasiDokumen[];
  formasiRequest: FormasiRequest;

  flowIds = [
    "for_flow_1",
    "for_flow_4"
  ];
  flowId: string = null;

  object: {
    objectFormasiDokumenId?: string,
    objectFormasiJb1Id?: string
    objectFormasiJb2Id?: string
    objectFormasiJb3Id?: string
    objectFormasiJb4Id?: string
    objectFormasiJb5Id?: string
    objectFormasiJb6Id?: string
    objectFormasiJb7Id?: string
    objectFormasiJb8Id?: string
    objectFormasiJb9Id?: string
    objectFormasiJb10Id?: string
    objectFormasiJb11Id?: string
  } = {};

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.getPendingTask();
  }

  getPendingTask() {
    this.apiService.getData(`/api/v1/pending_task/wf_name/${"formasi_task"}/${LoginContext.getUnitKerjaId()}`).subscribe({
      next: (response) => {
        this.pendingTask = new PendingTask(response);
        this.flowId = this.pendingTask.flowId;
        this.objectTask = this.pendingTask.objectTask;
        this.isRequestPage = true;

        if (this.flowId == "for_flow_4") {
          this.formasiRequest = new FormasiRequest(this.objectTask.object);
          this.formasiDokumenList = [];
          for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
            this.formasiDokumenList.push(formasiDokumen);
          }
        }
      },
      error: () => {
        this.isRequestPage = false;
      }
    })
  }

  submitFl1() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData(`/api/v1/formasi/task/submit`, new Task({
          id: this.pendingTask.id, taskAction: "approve"
        })).subscribe({
          next: () => window.location.reload(),
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', error.message);
            throw error;
          }
        })
      }
    })
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.formasiDokumenList[index].status = "PENDING";
        this.formasiDokumenList[index].dokumenFile = (reader.result as string);
      };

      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    }
  }

  submitFl4() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.formasiRequest.formasiDokumenList = this.formasiDokumenList;
        const task = new Task({
          id: this.pendingTask.id, taskAction: "approve",
          object: this.formasiRequest
        });

        this.apiService.postData(`/api/v1/formasi/task/submit`, task).subscribe({
          next: () => window.location.reload(),
          error: (error) => {
            console.error('Error fetching data', error);
            this.alertService.showToast('Error', error.message);
            throw error;
          }
        })
      }
    });
  }
}
