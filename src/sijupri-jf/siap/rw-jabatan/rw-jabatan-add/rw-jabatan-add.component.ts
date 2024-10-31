import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JabatanService } from '../../../../modules/maintenance/services/jabatan.service';
import { RWJabatan } from '../../../../modules/siap/models/rw-jabatan.model';
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model';
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle';
import { JenjangService } from '../../../../modules/maintenance/services/jenjang.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RwJabatanService } from '../../../../modules/siap/services/rw-jabatan.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { LoginContext } from '../../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-jabatan-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-jabatan-add.component.html',
  styleUrl: './rw-jabatan-add.component.scss'
})
export class RwJabatanAddComponent {
  rwJabatan: RWJabatan = new RWJabatan();
  jabatanList: Jabatan[];
  jenjangList: Jenjang[];

  rwJabatanForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.rwJabatanForm = new FormGroup({
      jabatanCode: new FormControl('', [Validators.required]),
      jenjangCode: new FormControl('', [Validators.required]),
      tmt: new FormControl('', [Validators.required]),
    })

    this.getJabatanList();
    this.getJenjangList();
  }

  inputs: FIleHandler = {
    files: {
      ijazah: { label: "Upload Dokumen SK Jabatan", source: this.rwJabatan.skJabatanUrl, required: true }
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
        this.alertService.showToast("Error", "Gagal mendapatkan data jabatan!");
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
        this.alertService.showToast("Error", "Gagal mendapatkan data jenjang!");
      }
    })
  }

  submit() {
    if(this.rwJabatanForm.valid) {
      this.rwJabatan.jabatanCode = this.rwJabatanForm.value.jabatanCode;
      this.rwJabatan.jenjangCode = this.rwJabatanForm.value.jenjangCode;
      this.rwJabatan.tmt = this.rwJabatanForm.value.tmt

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
  
          this.apiService.postData(`/api/v1/rw_jabatan/task`, this.rwJabatan).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat jabatan.");
              setTimeout(() => {
                this.router.navigate(['/profile/rw-jabatan/pending']);
              }, 2000); // Adjust the delay as needed
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat jebatan!");
            }
          })
        }
      });
    }

  }
}
