import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../modules/base/services/api.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model';
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle';
import { DokumenPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan.model';
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model';
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { Ukom } from '../../../modules/ukom/models/ukom.model';
import { JF } from '../../../modules/siap/models/jf.model';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-ukom-task-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileHandlerComponent
  ],
  templateUrl: './ukom-task-form.component.html',
  styleUrl: './ukom-task-form.component.scss'
})
export class UkomTaskFormComponent {
  @Input() jf: JF;
  @Input() ukom: Ukom = new Ukom();
  pesertaUkom: PesertaUkom = new PesertaUkom();
  jabatanList: Jabatan[] = [];
  dokumenPersyaratanList: DokumenPersyaratan[] = []
  nextJenjang: Jenjang;
  detectedDokumen: any = {};

  inputs: FIleHandler = {
    files: {},
    listen: (key: string, source: string, base64Data: string, label: string) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label
      };
    }
  };

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {

  }

  getDokumenPersyaratan() {
    this.apiService.getData(`/api/v1/doc_persyaratan/association/${this.pesertaUkom.jenisUkom}`).subscribe({
      next: (response) => {
        this.dokumenPersyaratanList = response.map((dokumenPersyaratan: { [key: string]: any; }) => new DokumenPersyaratan(dokumenPersyaratan));

        this.detectedDokumen = {};
        let count = 1;
        this.dokumenPersyaratanList.forEach(dokumenPersyaratan => {
          this.inputs.files["dokumenPersyaratan_" + count] = { label: dokumenPersyaratan.name }
          count = count + 1;
        });

      },
      error: (error) => this.handlerService.handleException(error)
    });
  }

  getNextJenjang() {
    this.apiService.getData(`/api/v1/jenjang/next/${this.jf.jenjangCode}`).subscribe({
      next: (response) => {
        this.nextJenjang = new Jenjang(response)
        this.pesertaUkom.nextJenjangCode = this.nextJenjang.code;
      },
      error: (error) => this.handlerService.handleException(error)
    })
  }

  getListJabatan() {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: (response) => this.jabatanList = response.map((jabatan: { [key: string]: any; }) => new Jabatan(jabatan)),
      error: (error) => this.handlerService.handleException(error)
    });
  }

  onJenisUkomSwitch(event: Event) {
    const jenisUkom = (event.target as HTMLSelectElement).value;
    this.pesertaUkom.nextJabatanCode = null;
    this.pesertaUkom.nextJenjangCode = null;


    if (jenisUkom) {
      this.pesertaUkom.jenisUkom = jenisUkom;
      this.getDokumenPersyaratan();
      if (jenisUkom == "PERPINDAHAN_JABATAN") {
        this.getListJabatan();
      } else if (jenisUkom == "KENAIKAN_JENJANG") {
        this.getNextJenjang();
      }
    }
  }

  submit() {
    this.pesertaUkom.dokumenPesertaUkom.length = 0;

    for (const key in this.detectedDokumen) {
      this.pesertaUkom.dokumenPesertaUkom.push({
        file: this.detectedDokumen[key].base64,
        dokumenName: this.detectedDokumen[key].label,
      });
    }

    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.pesertaUkom.nip = this.jf.nip;
        this.pesertaUkom.nik = this.jf.nik;
        this.pesertaUkom.name = this.jf.name;
        this.pesertaUkom.phone = this.jf.phone;
        this.pesertaUkom.email = this.jf.email;
        this.pesertaUkom.tempatLahir = this.jf.tempatLahir;
        this.pesertaUkom.tanggalLahir = this.jf.tanggalLahir;
        this.pesertaUkom.jenisKelaminCode = this.jf.jenisKelaminCode;
        this.pesertaUkom.ukomId = this.ukom.id;

        this.pesertaUkom.jabatanCode = this.jf.jabatanCode;
        this.pesertaUkom.jenjangCode = this.jf.jenjangCode;
        this.pesertaUkom.pangkatCode = this.jf.pangkatCode;

        if (this.pesertaUkom.jenisUkom == "PERPINDAHAN_JABATAN") {
          this.pesertaUkom.nextJenjangCode = this.jf.jenjangCode;
        } else if (this.pesertaUkom.jenisUkom == "KENAIKAN_JENJANG") {
          this.pesertaUkom.nextJabatanCode = this.jf.jabatanCode;
        }
        this.pesertaUkom.nextPangkatCode = this.jf.pangkatCode;

        this.pesertaUkom.instansiId = LoginContext.getInstansiId();
        this.pesertaUkom.unitKerjaId = LoginContext.getUnitKerjaId();

        this.apiService.postData(`/api/v1/peserta_ukom/task`, this.pesertaUkom).subscribe({
          next: () => window.location.reload(),
          error: (error) => this.handlerService.handleException(error)
        })
      }
    });
  }
}
