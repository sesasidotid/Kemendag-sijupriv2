import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model';
import { RWPangkat } from '../../../../modules/siap/models/rw-pangkat.model';
import { Router } from '@angular/router';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-pangkat-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-pangkat-add.component.html',
  styleUrl: './rw-pangkat-add.component.scss'
})
export class RwPangkatAddComponent {
  rwPangkat: RWPangkat = new RWPangkat();
  pangkatList: Pangkat[];

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "SK Pangkat", source: this.rwPangkat.skPangkatUrl },
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwPangkat.fileSkPangkat = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.getPangkatList();
  }

  getPangkatList() {
    this.apiService.getData(`/api/v1/pangkat`).subscribe({
      next: (response) => {
        this.pangkatList = response.map((pangkat: { [key: string]: any; }) => new Pangkat(pangkat))
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

        this.apiService.postData(`/api/v1/rw_pangkat/task`, this.rwPangkat).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil");
            this.router.navigate(['/profile/rw-pendidikan/pending'])
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
