import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JabatanService } from '../../../../modules/maintenance/services/jabatan.service';
import { RWJabatan } from '../../../../modules/siap/models/rw-jabatan.model';
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model';
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle';
import { JenjangService } from '../../../../modules/maintenance/services/jenjang.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RwJabatanService } from '../../../../modules/siap/services/rw-jabatan.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-jabatan-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-jabatan-add.component.html',
  styleUrl: './rw-jabatan-add.component.scss'
})
export class RwJabatanAddComponent {
  rwJabatan: RWJabatan = new RWJabatan();
  jabatanList: Jabatan[];
  jenjangList: Jenjang[];

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.getJabatanList();
    this.getJenjangList();
  }

  inputs: FIleHandler = {
    files: {
      ijazah: { label: "SK Jabatan", source: this.rwJabatan.skJabatanUrl }
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwJabatan.fileSkJabatan = base64Data;
    }
  }

  getJabatanList() {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: (response) => {
        this.jabatanList = response.map((jabatan: { [key: string]: any; }) => new Jabatan(jabatan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  getJenjangList() {
    this.apiService.getData(`/api/v1/jenjang`).subscribe({
      next: (response) => {
        this.jenjangList = response.map((jenjang: { [key: string]: any; }) => new Jenjang(jenjang))
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

        this.apiService.postData(`/api/v1/rw_jabatan/task`, this.rwJabatan).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil");
            this.router.navigate(['/profile/rw-jabatan/pending'])
          },
          error: (error) => {
            console.log("error", error);
            this.alertService.showToast("Error", "gagal mengirim data");
          }
        })
      }
    });
  }
}
