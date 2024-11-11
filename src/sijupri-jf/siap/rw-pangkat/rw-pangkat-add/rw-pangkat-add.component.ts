import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model';
import { RWPangkat } from '../../../../modules/siap/models/rw-pangkat.model';
import { Router } from '@angular/router';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-rw-pangkat-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-pangkat-add.component.html',
  styleUrl: './rw-pangkat-add.component.scss'
})
export class RwPangkatAddComponent {
  rwPangkat: RWPangkat = new RWPangkat();
  pangkatList: Pangkat[];
  rwPangkatForm!: FormGroup;

  submitLoading$ = new BehaviorSubject<boolean>(false)

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Upload Dokumen SK Pangkat", source: this.rwPangkat.skPangkatUrl, required: true },
    },
    listen: (key: string, source: string, base64Data: string) => {
      this.rwPangkatForm.patchValue({
        fileSkPangkat: base64Data
      });
    }
  }

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.rwPangkatForm = new FormGroup({
      pangkatCode: new FormControl('', [Validators.required]),
      tmt: new FormControl('', [Validators.required]),
      fileSkPangkat: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })
    this.getPangkatList();
  }

  getPangkatList() {
    this.apiService.getData(`/api/v1/pangkat`).subscribe({
      next: (response) => {
        this.pangkatList = response.map((pangkat: { [key: string]: any; }) => new Pangkat(pangkat))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data pangkat!");
      }
    })
  }

  submit() {
    if (this.rwPangkatForm.valid) {
      this.rwPangkat.pangkatCode = this.rwPangkatForm.value.pangkatCode;
      this.rwPangkat.tmt = this.rwPangkatForm.value.tmt;
      this.rwPangkat.fileSkPangkat = this.rwPangkatForm.value.fileSkPangkat;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true)
          
          this.apiService.postData(`/api/v1/rw_pangkat/task`, this.rwPangkat).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat pangkat.");
              this.submitLoading$.next(false)
              setTimeout(() => {
                this.router.navigate(['/profile/rw-pangkat/pending']);
              }, 1000); // Adjust the delay as needed
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat pangkat!");
            }
          });
        }
      });
    }
  }
}
