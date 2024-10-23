import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DokumenPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan.model';
import { ApiService } from '../../../modules/base/services/api.service';
import { AlertService } from '../../../modules/base/services/alert.service';

@Component({
  selector: 'app-formasi-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formasi-document-list.component.html',
  styleUrl: './formasi-document-list.component.scss'
})
export class FormasiDocumentListComponent {
  dokumenPersyaratan: DokumenPersyaratan = new DokumenPersyaratan();
  dokumenPersyaratanList: DokumenPersyaratan[] = [];

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getDokumentPersyaratanList();
  }

  getDokumentPersyaratanList() {
    this.apiService.getData(`/api/v1/doc_persyaratan/association/for_formasi`).subscribe({
      next: (dokumenPersyaratanList: DokumenPersyaratan[]) => this.dokumenPersyaratanList = dokumenPersyaratanList,
      error: (error) => {
        console.error('Error fetching data', error);
        this.alertService.showToast('Error', error.message);
        throw error;
      }
    });
  }

  submit() {
    this.dokumenPersyaratan.association = "for_formasi";
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
