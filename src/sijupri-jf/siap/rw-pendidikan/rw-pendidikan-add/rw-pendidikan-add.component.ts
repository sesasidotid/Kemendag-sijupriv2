import { Component } from '@angular/core';
import { RWPendidikan } from '../../../../modules/siap/models/rw-perndidikan.model';
import { Pendidikan } from '../../../../modules/maintenance/models/pendidikan.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';

@Component({
  selector: 'app-rw-pendidikan-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-pendidikan-add.component.html',
  styleUrl: './rw-pendidikan-add.component.scss'
})
export class RwPendidikanAddComponent {
  rwPendidikan: RWPendidikan = new RWPendidikan();
  pendidikanList: Pendidikan[];
  rwPendidikanForm!: FormGroup;

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.rwPendidikanForm = new FormGroup({
      institusiPendidikan: new FormControl('', [Validators.required]),
      pendidikanCode: new FormControl('', [Validators.required]),
      jurusan: new FormControl('', [Validators.required]),
      tanggalIjazah: new FormControl('', [Validators.required]),
      fileIjazah: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })
    this.getPendidikanList();
  }


  inputs: FIleHandler = {
    files: {
      ijazah: { label: 'Upload Dokumen Ijazah', source: this.rwPendidikan.ijazahUrl, required: true }
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwPendidikanForm.patchValue({
        fileIjazah: base64Data
      })
    }
  }

  getPendidikanList() {
    this.apiService.getData(`/api/v1/pendidikan`).subscribe({
      next: (response) => {
        this.pendidikanList = response.map((pendidikan: { [key: string]: any; }) => new Pendidikan(pendidikan))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data pendidikan!");
      }
    })
  }

  submit() {
    if (this.rwPendidikanForm.valid) {
      this.rwPendidikan.pendidikanCode = this.rwPendidikanForm.value.pendidikanCode;
      this.rwPendidikan.institusiPendidikan = this.rwPendidikanForm.value.institusiPendidikan;
      this.rwPendidikan.jurusan = this.rwPendidikanForm.value.jurusan;
      this.rwPendidikan.tanggalIjazah = this.rwPendidikanForm.value.tanggalIjazah;
      this.rwPendidikan.fileIjazah = this.rwPendidikanForm.value.fileIjazah;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
  
          this.apiService.postData(`/api/v1/rw_pendidikan/task`, this.rwPendidikan).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat pendidikan.");
              setTimeout(() => {
                this.router.navigate(['/profile/rw-pendidikan/pending']);
              }, 2000); // Adjust the delay as needed
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat pendidikan!");
            }
          });
        }
      });
    }
  }
}
