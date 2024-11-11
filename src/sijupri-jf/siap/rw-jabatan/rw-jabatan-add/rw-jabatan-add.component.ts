import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RWJabatan } from '../../../../modules/siap/models/rw-jabatan.model';
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model';
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';
import { BehaviorSubject } from 'rxjs';

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

  jenjangLoading$ = new BehaviorSubject<boolean>(false);
  submitLoading$ = new BehaviorSubject<boolean>(false);

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
      fileSkJabatan: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })

    this.getJabatanList();

    this.rwJabatanForm.get('jabatanCode').valueChanges.subscribe(jabatanCode => {
      if (jabatanCode) {
        this.getJenjangList(jabatanCode);
      } else {
        this.jenjangList = []; // Clear jenjang list if no jabatan selected
        this.rwJabatanForm.get('jenjangCode').setValue('');
      }
    });
  }

  inputs: FIleHandler = {
    files: {
      ijazah: { label: "Upload Dokumen SK Jabatan", source: this.rwJabatan.skJabatanUrl, required: true }
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwJabatanForm.patchValue({
        fileSkJabatan: base64Data
      })
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

  getJenjangList(jabatanId: string) {
    this.jenjangLoading$.next(true);
    this.apiService.getData(`/api/v1/jenjang/jabatan/${jabatanId}`).subscribe({
      next: (response) => {
        this.jenjangList = response.map((jenjang: { [key: string]: any; }) => new Jenjang(jenjang))
        this.jenjangLoading$.next(false);
      },
      error: (error) => {
        this.jenjangLoading$.next(false);
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data jenjang!");
      }
    })
  }

  submit() {
    if(this.rwJabatanForm.valid) {
      this.rwJabatan.jabatanCode = this.rwJabatanForm.value.jabatanCode;
      this.rwJabatan.jenjangCode = this.rwJabatanForm.value.jenjangCode;
      this.rwJabatan.tmt = this.rwJabatanForm.value.tmt;
      this.rwJabatan.fileSkJabatan = this.rwJabatanForm.value.fileSkJabatan;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true);
  
          this.apiService.postData(`/api/v1/rw_jabatan/task`, this.rwJabatan).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat jabatan.");
              this.submitLoading$.next(false);
              setTimeout(() => {
                this.router.navigate(['/profile/rw-jabatan/pending']);
              }, 1000); // Adjust the delay as needed
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
