import { Component } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { TabService } from '../../../modules/base/services/tab.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-ukom-grade-import',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './ukom-grade-import.component.html',
  styleUrl: './ukom-grade-import.component.scss'
})
export class UkomGradeImportComponent {
  ukomList: Ukom[] = []
  file_grade: string = "";

  inputs: FIleHandler = {
    files: {
      file_grade: { label: 'File Nilai Ukom' }
    },
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      switch (key) {
        case 'file_grade':
          this.file_grade = base64Data
          break
      }
    }
  }

  constructor(
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private tabService: TabService
  ) { }

  ngOnInit() {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'List Nilai Ukom',
        isActive: false,
        icon: 'mdi-list-box',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list`])
      })
      .addTab({
        label: 'Import Nilai',
        isActive: true,
        icon: 'mdi-plus-circle',
        onClick: () => this.router.navigate([`/ukom/ukom-grade-list/import`])
      })
      .addTab({
        label: 'Template Nilai',
        isActive: true,
        icon: 'mdi-file-download',
        onClick: () => this.downloadTemplate()
      })
  }

  downloadTemplate() {
    this.apiService
      .getDownload(`/api/v1/exam_grade/download`, 'template_grade.xlsx')
      .subscribe({
        error: error => this.handlerService.handleException(error)
      })
  }

  submit() {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService
          .postData('/api/v1/exam_grade/upload', { file_grade: this.file_grade })
          .subscribe({
            next: () => window.location.reload(),
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }
}
