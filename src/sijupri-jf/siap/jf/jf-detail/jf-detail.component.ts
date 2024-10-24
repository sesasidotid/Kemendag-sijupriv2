import { Component } from '@angular/core';
import { JF } from '../../../../modules/siap/models/jf.model';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { ApiService } from '../../../../modules/base/services/api.service';
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model';
import { JenisKelamin } from '../../../../modules/maintenance/models/jenis-kelamin.model';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';


@Component({
  selector: 'app-jf-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './jf-detail.component.html',
  styleUrl: './jf-detail.component.scss'
})
export class JfDetailComponent {
  jf: JF = new JF();
  jenisKelaminList: JenisKelamin[] = [];
  nip: string = LoginContext.getUserId();
  isEditOpen: boolean = false;

  inputs: FIleHandler = {
    files: {
      ktp: { label: "KTP", source: this.jf.ktpUrl },
    },
    viewOnly: true,
    listen: (key: string, source: string, base64Data: string) => {
      this.jf.fileKtp = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getJf();
  }

  getJf() {
    this.apiService.getData(`/api/v1/jf/${this.nip}`).subscribe({
      next: (response) => {
        this.jf = new JF(response);
        this.inputs.files['ktp'].source = this.jf.ktpUrl
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "gagal menerima data");
      }
    })
  }

  getJenisKelamin() {
    this.apiService.getData(`/api/v1/jenis_kelamin`).subscribe({
      next: (response) => {
        this.jenisKelaminList = response.map((jenisKelamin: { [key: string]: any; }) => new JenisKelamin(jenisKelamin));
      },
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', "gagal menerima data");
      }
    })
  }

  toggleEdit() {
    this.isEditOpen = !this.isEditOpen;
    this.inputs.viewOnly = !this.isEditOpen;
    if (this.isEditOpen) {
      this.getJenisKelamin();
    }
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.putData(`/api/v1/jf/task`, this.jf).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil");
            this.router.navigate([LoginContext.getUserLoginRoute() +'/profile/pending'])
          }
        })
      }
    })
  }
}
