import { Component } from '@angular/core';
import { ApiService } from '../../../modules/base/services/api.service';
import { HandlerService } from '../../../modules/base/services/handler.service';
import { ConfirmationService } from '../../../modules/base/services/confirmation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component';
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler';
import { Ukom } from '../../../modules/ukom/models/ukom.model';
import { TabService } from '../../../modules/base/services/tab.service';

@Component({
  selector: 'app-ukom-grade-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileHandlerComponent
  ],
  templateUrl: './ukom-grade-import.component.html',
  styleUrl: './ukom-grade-import.component.scss'
})
export class UkomGradeImportComponent {
  ukomList: Ukom[] = [];
  gradeImport: {
    ukomId?: string
    fileNilaiMansoskul?: string,
    fileNilaiTeknis?: string
  } = {}

  inputs: FIleHandler = {
    files: {
      mansoskul: { label: "File Nilai Mansoskul" },
      teknis: { label: "File Nilai Teknis" }
    },
    listen: (key: string, source: string, base64Data: string, label: string) => {
      switch (key) {
        case "mansoskul":
          this.gradeImport.fileNilaiMansoskul = base64Data
          break;
        case "teknis":
          this.gradeImport.fileNilaiTeknis = base64Data
          break;
      }
    }
  };

  constructor(
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private tabService: TabService,
  ) { }

  ngOnInit() {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs();
    }
    
    this.tabService.addTab({
      label: 'Template Mansoskul',
      isActive: true,
      icon: 'mdi-file-download',
      onClick: () => this.downloadTemplate('template_mansoskul'),
    }).addTab({
      label: 'Template Teknis',
      isActive: true,
      icon: 'mdi-file-download',
      onClick: () => this.downloadTemplate('template_teknis'),
    });

    this.getUkomList();
  }

  downloadTemplate(filename: string) {
    this.apiService.getDownload(`/storage_system/template/${filename}.xlsx/download`, `${filename}.xlsx`).subscribe({
      error: (error) => this.handlerService.handleException(error)
    });
  }

  getUkomList() {
    this.apiService.getData("/api/v1/ukom").subscribe({
      next: (response) => this.ukomList = response.map((ukom: { [key: string]: any; }) => new Ukom(ukom)),
      error: (error) => this.handlerService.handleException(error)
    })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: (result) => {
        if (!result.confirmed) return;

        this.apiService.postData('/api/v1/nilai_ukom/import', this.gradeImport).subscribe({
          next: () => window.location.reload(),
          error: (error) => this.handlerService.handleException(error)
        })
      }
    })
  }
}
