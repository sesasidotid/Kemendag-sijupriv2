import { Component } from '@angular/core';
import { DokumenPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan.model';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ukom-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ukom-document-list.component.html',
  styleUrl: './ukom-document-list.component.scss'
})
export class UkomDocumentListComponent {
  dokumenPersyaratan: DokumenPersyaratan = new DokumenPersyaratan();
  dokumenPersyaratanList: DokumenPersyaratan[] = [];
  association: string;

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getDokumentPersyaratanList();
  }

  getDokumentPersyaratanList() {
    this.dokumenPersyaratanList.length = 0;

    for (const association of ['KENAIKAN_JENJANG', 'PERPINDAHAN_JABATAN', 'PROMOSI']) {
      this.apiService.getData(`/api/v1/doc_persyaratan/association/${association}`).subscribe({
        next: (response) => {
          this.dokumenPersyaratanList.push(...response.map((dokumenPersyaratan: { [key: string]: any; }) => new DokumenPersyaratan(dokumenPersyaratan)));
        },
        error: (error) => {
          console.error('Error fetching data', error);
          this.alertService.showToast('Error', error.message);
          throw error;
        }
      });
    }
  }

  submit() {
    this.dokumenPersyaratan.association = this.association;
    this.apiService.postData(`/api/v1/doc_persyaratan`, this.dokumenPersyaratan).subscribe({
      next: () => this.getDokumentPersyaratanList(),
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      }
    });
  }

  delete(id: string) {
    this.apiService.deleteData(`/api/v1/doc_persyaratan/${id}`).subscribe({
      next: () => this.getDokumentPersyaratanList(),
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      }
    });
  }
}
