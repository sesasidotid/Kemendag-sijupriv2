import { Component } from '@angular/core';
import { RWPendidikan } from '../../../../modules/siap/models/rw-perndidikan.model';
import { Pendidikan } from '../../../../modules/maintenance/models/pendidikan.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { LoginContext } from '../../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-pendidikan-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-pendidikan-add.component.html',
  styleUrl: './rw-pendidikan-add.component.scss'
})
export class RwPendidikanAddComponent {
  rwPendidikan: RWPendidikan = new RWPendidikan();
  pendidikanList: Pendidikan[];

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.getPendidikanList();
  }

  inputs: FIleHandler = {
    files: {
      ijazah: { label: "Ijaza", source: this.rwPendidikan.ijazahUrl }
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwPendidikan.fileIjazah = base64Data;
    }
  }

  getPendidikanList() {
    this.apiService.getData(`/api/v1/pendidikan`).subscribe({
      next: (response) => {
        this.pendidikanList = response.map((pendidikan: { [key: string]: any; }) => new Pendidikan(pendidikan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData(`/api/v1/rw_pendidikan/task`, this.rwPendidikan).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil");
            this.router.navigate([LoginContext.getUserLoginRoute() +'/profile/rw-pendidikan/pending'])
          },
          error: (error) => {
            console.log("error", error);
            this.alertService.showToast("Error", "gagal mengirim data");
          }
        });
      }
    });
  }
}
