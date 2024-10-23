import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RWSertifikasi } from '../../../../modules/siap/models/rw-sertifikasi.model';
import { KategoriSertifikasi } from '../../../../modules/maintenance/models/kategori-sertifikasi.model';
import { RwSertifikasiService } from '../../../../modules/siap/services/rw-sertifikasi.service';
import { KategoriSertifikasiService } from '../../../../modules/maintenance/services/kategori-sertifikasi.service';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';

@Component({
  selector: 'app-rw-sertifikasi-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './rw-sertifikasi-add.component.html',
  styleUrl: './rw-sertifikasi-add.component.scss'
})
export class RwSertifikasiAddComponent {
  rwSertifikasi: RWSertifikasi = new RWSertifikasi();
  kategoriSertifikasiList: KategoriSertifikasi[] = [];
  kategori: number = 0;

  inputs: FIleHandler = {
    files: {
      skPengangkatan: { label: "SK Pengankatan", source: this.rwSertifikasi.skPengangkatanUrl },
      ktpPpns: { label: "KTP PPNS", source: this.rwSertifikasi.ktpPpnsUrl, visible: () => this.kategori == 2 }
    },
    listen: (key: string, source: string, base64Data: string) => {
      if (key == "skPengangkatan")
        this.rwSertifikasi.fileSkPengangkatan = base64Data;
      else if (key == "ktpPpns")
        this.rwSertifikasi.fileKtpPpns = base64Data;
    }
  }

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getKategoriSertifikasiList();
  }

  getKategoriSertifikasiList() {
    this.apiService.getData(`/api/v1/kategori_sertifikasi`).subscribe({
      next: (response) => {
        this.kategoriSertifikasiList = response.map((kategoriSertifikasi: { [key: string]: any; }) => new KategoriSertifikasi(kategoriSertifikasi))
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "gagal menerima data");
      }
    })
  }

  setKategori() {
    this.kategoriSertifikasiList.forEach(kategoriSertifikasi => {
      if (kategoriSertifikasi.id == this.rwSertifikasi.kategoriSertifikasiId) {
        this.kategori = kategoriSertifikasi.value;
      }
    });
  }

  submit() {
    if (this.kategori != 2) {
      this.rwSertifikasi.dateEnd = undefined;
      this.rwSertifikasi.dateStart = undefined;
      this.rwSertifikasi.wilayahKerja = undefined;
      this.rwSertifikasi.uuKawalan = undefined;
      this.rwSertifikasi.ktpPpns = undefined;
      this.rwSertifikasi.ktpPpnsUrl = undefined;
      this.rwSertifikasi.fileKtpPpns = undefined;
    }

    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData(`/api/v1/rw_sertifikasi/task`, this.rwSertifikasi).subscribe({
          next: () => {
            this.alertService.showToast('Success', "Berhasil");
            this.router.navigate(['/profile/rw-sertifikasi/pending'])
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
