import { Component } from '@angular/core';
import { FormasiRequest } from '../../../modules/formasi/models/formasi-request.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PendingTask } from '../../../modules/workflow/models/pending-task.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { Formasi } from '../../../modules/formasi/models/formasi.model';
import { take } from 'rxjs';
import { Task } from '../../../modules/workflow/models/task.model';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-formasi-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './formasi-task-detail.component.html',
  styleUrl: './formasi-task-detail.component.scss'
})
export class FormasiTaskDetailComponent {
  pendingTask: PendingTask = new PendingTask();
  formasiRequest: FormasiRequest = new FormasiRequest();
  unitKerja: UnitKerja = new UnitKerja();
  formasiList: Formasi[] = [];
  pendingTaskId: string;
  isApproveEnable: boolean = true;

  jabatanMapping: { [key: string]: string } = {
      'JB1': 'Analis Perdagangan',
      'JB4': 'Pengawas Perdagangan',
      'JB7': 'Penguji Mutu Barang',
      'JB9': 'Pengawas Kemetrologian',
      'JB10': 'Pengamat Tera',
      'JB11': 'Penera'
  };

  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.pendingTaskId = params.get('id');
    });
  }

  ngOnInit() {
    this.getPendingTask();
  }

  getUserLoginRoute() {
    return LoginContext.getUserLoginRoute();
  }

  getPendingTask() {
    this.apiService.getData(`/api/v1/pending_task/${this.pendingTaskId}`).subscribe({
      next: (response) => {
        this.pendingTask = new PendingTask(response);
        this.formasiRequest = new FormasiRequest(this.pendingTask.objectTask.object);
        this.getUnitKerja(this.formasiRequest.unitKerjaId);
        this.getPendingFormasi(this.formasiRequest.unitKerjaId);
        for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
          formasiDokumen.status = "APPROVE";
        }
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      }
    });
  }

  getUnitKerja(unitKerjaId: string) {
    this.apiService.getData(`/api/v1/unit_kerja/${unitKerjaId}`).subscribe({
      next: (response) => {
        this.unitKerja = new UnitKerja(response);
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      }
    });
  }

  getPendingFormasi(unitKerjaId: string) {
    this.apiService.getData(`/api/v1/pending_formasi/${unitKerjaId}`).subscribe({
      next: (response) => {
        this.formasiList = response.map((formasi: { [key: string]: any; }) => new Formasi(formasi));
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.formasiRequest.fileRekomendasi = (reader.result as string);
      };

      reader.onerror = (error) => {
        console.error('Error: ', error);
      };
    }
  }

  onFIleSwitch(index: number, status: 'APPROVE' | 'REJECT') {
    this.formasiRequest.formasiDokumenList[index].status = status;

    for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
      if (formasiDokumen.status == 'REJECT') {
        this.isApproveEnable = false;
        break;
      }
      this.isApproveEnable = true;
    }
  }

  submitFl2(isApprove: boolean) {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        const task = new Task({
          id: this.pendingTask.id,
          taskAction: isApprove ? "approve" : "reject",
          object: this.formasiRequest,
          remark: result.comment || null
        })

        this.apiService.postData(`/api/v1/formasi/task/submit`, task).subscribe({
          next: () => window.location.reload(),
        })
      }
    });
  }

  submitFl3() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        const task = new Task({
          id: this.pendingTask.id,
          taskAction: "approve",
          object: this.formasiRequest,
        })

        this.apiService.postData(`/api/v1/formasi/task/submit`, task).subscribe({
          next: () => window.location.reload(),
        })
      }
    });
  }
}
