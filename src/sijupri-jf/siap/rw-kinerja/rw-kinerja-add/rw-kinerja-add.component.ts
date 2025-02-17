import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model';
import { RatingKinerja } from '../../../../modules/maintenance/models/rating-kinerja.model';
import { PredikatKinerja } from '../../../../modules/maintenance/models/predikat-kinerja.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-rw-kinerja-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-kinerja-add.component.html',
  styleUrl: './rw-kinerja-add.component.scss'
})
export class RwKinerjaAddComponent {
  rwKinerja: RWKinerja = new RWKinerja();
  ratingKinerjaList: RatingKinerja[];
  predikatKinerjaList: PredikatKinerja[];

  predikatLoading$ = new BehaviorSubject<boolean>(false);
  ratingLoading$ = new BehaviorSubject<boolean>(false);
  submitLoading$ = new BehaviorSubject<boolean>(false);

  rwKinerjaForm!: FormGroup

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Upload Dokumen Evaluasi", fileName: this.rwKinerja.docEvaluasi, source: this.rwKinerja.docEvaluasiUrl, required: true },
      docPredikat: { label: "Upload Dokumen Predikat", fileName: this.rwKinerja.docPredikat, source: this.rwKinerja.docPredikatUrl, required: true },
      docAkumulasiAk: { label: "Upload Dokumen Akumulasi Angka Kredit", fileName: this.rwKinerja.docAkumulasiAk, source: this.rwKinerja.docAkumulasiAkUrl, required: true },
      docPenetapanAk: { label: "Upload Dokumen Penetapan Angka Kredit", fileName: this.rwKinerja.docPenetapanAk, source: this.rwKinerja.docPenetapanAkUrl, required: true },
    },
    listen: (key: string, source: string, base64Data: string) => {
      if (key == "docEvaluas")
        this.rwKinerjaForm.patchValue({ fileDocEvaluasi: base64Data });
      if (key == "docPredikat")
        this.rwKinerjaForm.patchValue({ fileDocPredikat: base64Data });
      if (key == "docAkumulasiAk")
        this.rwKinerjaForm.patchValue({ fileDocAkumulasiAk: base64Data });
      if (key == "docPenetapanAk")
        this.rwKinerjaForm.patchValue({ fileDocPenetapanAk: base64Data });
    }
  }

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {
    this.rwKinerjaForm = new FormGroup({
      dateEnd: new FormControl('', [Validators.required]),
      dateStart: new FormControl('', [Validators.required]),
      predikatKinerjaId: new FormControl('', [Validators.required]),
      ratingHasilId: new FormControl('', [Validators.required]),
      ratingKinerjaId: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      angkaKredit: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')]),
      fileDocEvaluasi: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      fileDocPredikat: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      fileDocAkumulasiAk: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
      fileDocPenetapanAk: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })

    this.getRatingKinerjaList();
    this.getPredikatKinerjaList();
  }

  getRatingKinerjaList() {
    this.ratingLoading$.next(true);
    this.apiService.getData(`/api/v1/rating_kinerja`).subscribe({
      next: (response) => {
        this.ratingKinerjaList = response.map((ratingKinerja: { [key: string]: any; }) => new RatingKinerja(ratingKinerja))
        this.ratingLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data rating kinerja!");
        this.ratingLoading$.next(false);
      }
    })
  }

  getPredikatKinerjaList() {
    this.predikatLoading$.next(true);
    this.apiService.getData(`/api/v1/predikat_kinerja`).subscribe({
      next: (response) => {
        this.predikatKinerjaList = response.map((predikatKinerja: { [key: string]: any; }) => new PredikatKinerja(predikatKinerja))
        this.predikatLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data predikat kinerja!");
        this.predikatLoading$.next(false);
      }
    })
  }

  submit() {
    if (this.rwKinerjaForm.valid) {
      this.rwKinerja.dateEnd = this.rwKinerjaForm.value.dateEnd;
      this.rwKinerja.dateStart = this.rwKinerjaForm.value.dateStart;
      this.rwKinerja.predikatKinerjaId = this.rwKinerjaForm.value.predikatKinerjaId;
      this.rwKinerja.ratingHasilId = this.rwKinerjaForm.value.ratingHasilId;
      this.rwKinerja.ratingKinerjaId = this.rwKinerjaForm.value.ratingKinerjaId;
      this.rwKinerja.type = this.rwKinerjaForm.value.type;
      this.rwKinerja.angkaKredit = this.rwKinerjaForm.value.angkaKredit;
      this.rwKinerja.fileDocEvaluasi = this.rwKinerjaForm.value.fileDocEvaluasi;
      this.rwKinerja.fileDocPredikat = this.rwKinerjaForm.value.fileDocPredikat;
      this.rwKinerja.fileDocAkumulasiAk = this.rwKinerjaForm.value.fileDocAkumulasiAk;
      this.rwKinerja.fileDocPenetapanAk = this.rwKinerjaForm.value.fileDocPenetapanAk;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true);
  
          this.apiService.postData(`/api/v1/rw_kinerja/task`, this.rwKinerja).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat kinerja.");
              this.submitLoading$.next(false);
              setTimeout(() => {
                this.router.navigate(['/profile/rw-kinerja/pending']);
              }, 1000); // Adjust the delay as needed
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat kinerja!");
              this.submitLoading$.next(false);
            }
          });
        }
      });
    }
  }
}
