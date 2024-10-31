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

  rwKinerjaForm!: FormGroup

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Upload Dokumen Evaluasi", source: this.rwKinerja.docEvaluasiUrl, required: true },
      docPredikat: { label: "Upload Dokumen Predikat", source: this.rwKinerja.docPredikatUrl, required: true },
      docAkumulasiAk: { label: "Upload Dokumen Akumulasi Angka Kredit", source: this.rwKinerja.docAkumulasiAkUrl, required: true },
      docPenetapanAk: { label: "Upload Dokumen Penetapan Angka Kredit", source: this.rwKinerja.docPenetapanAkUrl, required: true },
    },
    listen: (key: string, source: string, base64Data: string) => {
      if (key == "docEvaluas")
        this.rwKinerja.fileDocEvaluasi = base64Data;
      else if (key == "docPredikat")
        this.rwKinerja.fileDocPredikat = base64Data;
      else if (key == "docAkumulasiAk")
        this.rwKinerja.fileDocAkumulasiAk = base64Data;
      else if (key == "docPenetapanAk")
        this.rwKinerja.fileDocPenetapanAk = base64Data;
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
      angkaKredit: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$')])
    })

    this.getRatingKinerjaList();
    this.getPredikatKinerjaList();
  }

  getRatingKinerjaList() {
    this.apiService.getData(`/api/v1/rating_kinerja`).subscribe({
      next: (response) => {
        this.ratingKinerjaList = response.map((ratingKinerja: { [key: string]: any; }) => new RatingKinerja(ratingKinerja))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data rating kinerja!");
      }
    })
  }

  getPredikatKinerjaList() {
    this.apiService.getData(`/api/v1/predikat_kinerja`).subscribe({
      next: (response) => {
        this.predikatKinerjaList = response.map((predikatKinerja: { [key: string]: any; }) => new PredikatKinerja(predikatKinerja))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data predikat kinerja!");
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

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
  
          this.apiService.postData(`/api/v1/rw_kinerja/task`, this.rwKinerja).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat kinerja.");
              setTimeout(() => {
                this.router.navigate(['/profile/rw-kinerja/pending']);
              }, 2000); // Adjust the delay as needed
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat kinerja!");
            }
          });
        }
      });
    }
  }
}
