import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { LoginContext } from '../../../../modules/base/commons/login-context';

@Component({
  selector: 'app-rw-sertifikasi-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-sertifikasi-add.component.html',
  styleUrl: './rw-sertifikasi-add.component.scss'
})
export class RwSertifikasiAddComponent {
  rwSertifikasi: RWSertifikasi = new RWSertifikasi();
  kategoriSertifikasiList: KategoriSertifikasi[] = [];
  kategori: number = 1;

  rwSertifikasiForm!: FormGroup;

  inputs: FIleHandler = {
    files: {
      skPengangkatan: { label: "Upload Dokumen SK Pengangkatan", source: this.rwSertifikasi.skPengangkatanUrl, required: true },
      ktpPpns: { label: "Upload Dokumen KTP PPNS", source: this.rwSertifikasi.ktpPpnsUrl, required: true, visible: () => this.kategori == 2 }
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
  ) {
    this.rwSertifikasiForm = new FormGroup({
      noSk: new FormControl('', [Validators.required]),
      tglSk: new FormControl('', [Validators.required]),
    })
    this.getKategoriSertifikasiList();
  }
  
  getKategoriSertifikasiList() {
    this.apiService.getData(`/api/v1/kategori_sertifikasi`).subscribe({
      next: (response) => {
        this.kategoriSertifikasiList = response.map((kategoriSertifikasi: { [key: string]: any; }) => new KategoriSertifikasi(kategoriSertifikasi))
        this.rwSertifikasi.kategoriSertifikasiId = this.kategoriSertifikasiList[0].id;
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data kategori sertifikasi!");
      }
    })
  }

  setKategori(kategoriSertifikasiValue: number, kategoriSertifikasiId: string) {
    // this.kategoriSertifikasiList.forEach(kategoriSertifikasi => {
    //   if (kategoriSertifikasi.id == this.rwSertifikasi.kategoriSertifikasiId) {
    //     this.kategori = kategoriSertifikasi.value;
    //   }
    // });
    this.kategori = kategoriSertifikasiValue;
    this.rwSertifikasi.kategoriSertifikasiId = kategoriSertifikasiId;

    if (kategoriSertifikasiValue === 1) {
      this.rwSertifikasiForm = new FormGroup({
        noSk: new FormControl('', [Validators.required]),
        tglSk: new FormControl('', [Validators.required]),
      })
    }
    else if (kategoriSertifikasiValue === 2) {
      this.rwSertifikasiForm = new FormGroup({
        noSk: new FormControl('', [Validators.required]),
        tglSk: new FormControl('', [Validators.required]),
        dateStart: new FormControl('', [Validators.required]),
        dateEnd: new FormControl('', [Validators.required]),
        wilayahKerja: new FormControl('', [Validators.required]),
        uuKawalan: new FormControl('', [Validators.required]),
      })
    }
  }

  submit() {
    if(this.rwSertifikasiForm.valid) {
      this.rwSertifikasi.noSk = this.rwSertifikasiForm.value.noSk;
      this.rwSertifikasi.tglSk = this.rwSertifikasiForm.value.tglSk;
      this.rwSertifikasi.dateStart = this.rwSertifikasiForm.value.dateStart;
      this.rwSertifikasi.dateEnd = this.rwSertifikasiForm.value.dateEnd;
      this.rwSertifikasi.wilayahKerja = this.rwSertifikasiForm.value.wilayahKerja;
      this.rwSertifikasi.uuKawalan = this.rwSertifikasiForm.value.uuKawalan;

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
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat sertifikasi.");
              this.router.navigate(['/profile/rw-sertifikasi/pending'])
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat sertifikasi!");
            }
          });
        }
      });
    }
  }
}
