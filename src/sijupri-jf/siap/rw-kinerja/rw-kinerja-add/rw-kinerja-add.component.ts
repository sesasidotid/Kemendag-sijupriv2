import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model';
import { RatingKinerja } from '../../../../modules/maintenance/models/rating-kinerja.model';
import { PredikatKinerja } from '../../../../modules/maintenance/models/predikat-kinerja.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { LoginContext } from '../../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-kinerja-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-kinerja-add.component.html',
  styleUrl: './rw-kinerja-add.component.scss'
})
export class RwKinerjaAddComponent {
  rwKinerja: RWKinerja = new RWKinerja();
  ratingKinerjaList: RatingKinerja[];
  predikatKinerjaList: PredikatKinerja[];

  inputs: FIleHandler = {
    files: {
      docEvaluas: { label: "Dokumen Evaluasi", source: this.rwKinerja.docEvaluasiUrl },
      docPredikat: { label: "Dokumen Predikat", source: this.rwKinerja.docPredikatUrl },
      docAkumulasiAk: { label: "Dokumen Akumulasi Angka Kredit", source: this.rwKinerja.docAkumulasiAkUrl },
      docPenetapanAk: { label: "Dokumen Penetapan Angka Kredit", source: this.rwKinerja.docPenetapanAkUrl },
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
        this.alertService.showToast("Error", "gagal menerima data");
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
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData(`/api/v1/rw_kinerja/task`, this.rwKinerja).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil");
            this.router.navigate(['/profile/rw-kinerja/pending'])
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
