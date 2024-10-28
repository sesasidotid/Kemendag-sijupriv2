import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../modules/base/services/api.service';
import { EditorModule } from '@tinymce/tinymce-angular';
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver';
import 'tinymce/plugins/image';
import 'tinymce/plugins/code';
import { AlertService } from '../../../modules/base/services/alert.service';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component';
import { Router } from '@angular/router';
import { ActionColumnBuilder, PagableBuilder, PageFilterBuilder, PrimaryColumnBuilder } from '../../../modules/base/commons/pagable/pagable-builder';
import { Pagable } from '../../../modules/base/commons/pagable/pagable';
import { Ukom } from '../../../modules/ukom/models/ukom.model';
import { TabService } from '../../../modules/base/services/tab.service';
import { LoginContext } from '../../../modules/base/commons/login-context';

@Component({
  selector: 'app-ukom-periode',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule, PagableComponent],
  templateUrl: './ukom-periode.component.html',
  styleUrl: './ukom-periode.component.scss'
})
export class UkomPeriodeComponent {
  ukom: Ukom = new Ukom();
  editorContent: string = '';
  init: any;
  pagable: Pagable;

  constructor(
    private apiService: ApiService,
    private allertService: AlertService,
    private confirmationService: ConfirmationService,
    private tabService: TabService,
    private router: Router
  ) {
    this.pagable = new PagableBuilder("/api/v1/ukom/search")
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal Dibuka", 'periodePendaftaran|startDate').build())
      .addPrimaryColumn(new PrimaryColumnBuilder("Tanggal Ditutup", 'periodePendaftaran|endDate').build())
      .addActionColumn(new ActionColumnBuilder().setAction((periodePendafatan: any) => {
        this.router.navigate([`/ukom/ukom-periode/${periodePendafatan.id}`])
      }, "info").withIcon("detail").build())
      .addFilter(new PageFilterBuilder("equal").setProperty("periodePendaftaran|startDate").withField("Tanggal Dibuka", "text").build())
      .addFilter(new PageFilterBuilder("equal").setProperty("periodePendaftaran|endDate").withField("Tanggal Ditutup", "text").build())
      .build();
  }

  ngOnInit() {
    this.tabService.addTab({
      label: 'Daftar User Instansi',
      isActive: true,
      onClick: () => this.router.navigate(['/ukom/ukom-periode']),
    }).addTab({
      label: 'Tambah User Instansi',
      onClick: () => this.router.navigate(['/ukom/ukom-periode/add']),
    });
  }

  handleImageUpload = (blobInfo: any, progress: Function) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blobInfo.blob());

    reader.onprogress = (e) => {
      progress(e.loaded / e.total * 100);
    };

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      console.error('Image to Base64 failed', error);
      reject('Image upload failed');
    };
  });

  onEditorChange(content: any) {
    this.editorContent = content;
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData("/api/v1/ukom", this.ukom).subscribe({
          next: (response) => {
            console.log('Success:', response);
          },
          error: (error) => {
            console.error('Error:', error);
            this.allertService.showToast("Error", "gagal mengirimkan informasi");
          }
        });
      }
    })
  }
}
