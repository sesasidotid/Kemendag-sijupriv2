import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RWKompetensi } from '../../../../modules/siap/models/rw-kompetensi.model';
import { AlertService } from '../../../../modules/base/services/alert.service';
import { Router } from '@angular/router';
import { KategoriPengembangan } from '../../../../modules/maintenance/models/kategori-pengembangan.model';
import { ApiService } from '../../../../modules/base/services/api.service';
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service';
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler';
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component';
import { LoginContext } from '../../../../modules/base/commons/login-context';
import { fileValidator } from '../../../../modules/base/validators/file-format.validator';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-rw-kompetensi-add',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent, ReactiveFormsModule],
  templateUrl: './rw-kompetensi-add.component.html',
  styleUrl: './rw-kompetensi-add.component.scss'
})
export class RwKompetensiAddComponent {
  rwKompetensi: RWKompetensi = new RWKompetensi()
  kategoriPengembanganList: KategoriPengembangan[] = [];

  rwKompetensiForm!: FormGroup;

  kategoriPengembanganLoading$ = new BehaviorSubject<boolean>(false);
  submitLoading$ = new BehaviorSubject<boolean>(false);

  inputs: FIleHandler;

  constructor(
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.rwKompetensiForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      kategoriPengembanganId: new FormControl('', [Validators.required]),
      dateStart: new FormControl('', [Validators.required]),
      dateEnd: new FormControl('', [Validators.required]),
      tglSertifikat: new FormControl('', [Validators.required]),
      fileSertifikat: new FormControl('', [Validators.required, fileValidator(['application/pdf'], 2)]),
    })

    this.getKategoriPengembanganList();
    this.fileLoadHandler();
  }

  fileLoadHandler() {
    this.inputs = {
      files: {
        docEvaluas: { label: "Upload Dokumen Sertifikat", fileName:this.rwKompetensi.sertifikat, source: this.rwKompetensi.sertifikatUrl, required: true },
      },
      listen: (key: string, source: string, base64Data: string) => {
        this.rwKompetensiForm.patchValue({ fileSertifikat: base64Data });
      }
    }
  }

  getKategoriPengembanganList() {
    this.kategoriPengembanganLoading$.next(true);
    this.apiService.getData(`/api/v1/kategori_pengembangan`).subscribe({
      next: (response) => {
        this.kategoriPengembanganList = response.map((kategoriPengembangan: { [key: string]: any; }) => new KategoriPengembangan(kategoriPengembangan))
        this.kategoriPengembanganLoading$.next(false);
      },
      error: (error) => {
        console.log("error", error);
        this.alertService.showToast("Error", "Gagal mendapatkan data kategori pengembangan!");
        this.kategoriPengembanganLoading$.next(false);
      }
    })
  }

  submit() {
    if (this.rwKompetensiForm.valid) {
      this.rwKompetensi.name = this.rwKompetensiForm.value.name;
      this.rwKompetensi.kategoriPengembanganId = this.rwKompetensiForm.value.kategoriPengembanganId;
      this.rwKompetensi.dateStart = this.rwKompetensiForm.value.dateStart;
      this.rwKompetensi.dateEnd = this.rwKompetensiForm.value.dateEnd;
      this.rwKompetensi.tglSertifikat = this.rwKompetensiForm.value.tglSertifikat;
      this.rwKompetensi.fileSertifikat = this.rwKompetensiForm.value.fileSertifikat;

      this.confirmationService.open(false).subscribe({
        next: (result) => {
          if (!result.confirmed) return;
          this.submitLoading$.next(true);
  
          this.apiService.postData(`/api/v1/rw_kompetensi/task`, this.rwKompetensi).subscribe({
            next: () => {
              this.alertService.showToast('Success', "Berhasil menambahkan riwayat kompetensi.");
              this.submitLoading$.next(false);
              this.router.navigate(['/profile/rw-kompetensi/pending'])
            },
            error: (error) => {
              console.log("error", error);
              this.alertService.showToast("Error", "Gagal menambahkan riwayat kompetensi!");
              this.submitLoading$.next(false);
            }
          });
        }
      });
    }

  }
}
