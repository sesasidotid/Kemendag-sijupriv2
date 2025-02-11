import { DokumenUkomList } from '../../../../modules/ukom/models/ukom-task-detail.modal'
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { Ukom } from '../../../../modules/ukom/models/ukom.model'
import { JF } from '../../../../modules/siap/models/jf.model'
import { CommonModule } from '@angular/common'
import { PesertaUkom } from '../../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { DokumenUkomPersyaratan } from '../../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import { UkomTaskDetail } from '../../../../modules/ukom/models/ukom-task-detail.modal'
import { switchMap } from 'rxjs'
import { RevisiDokumenUkom } from '../../../../modules/ukom/models/revisi-dokumen-ukom.model'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
@Component({
  selector: 'app-nonjf-revisi-ukom',
  standalone: true,
  imports: [
    FileHandlerComponent,
    CommonModule,
    ConfirmationDialogComponent,
    FilePreviewComponent
  ],
  templateUrl: './nonjf-revisi-ukom.component.html',
  styleUrl: './nonjf-revisi-ukom.component.scss'
})
export class NonjfRevisiUkomComponent {
  @Input() pendingTask: UkomTaskDetail = new UkomTaskDetail()
  @Input() key: string = ''
  revisedDokumen: RevisiDokumenUkom = new RevisiDokumenUkom()
  rejectedDokumen: any[] = []
  detectedDokumen: any = {}
  pesertaUkom: PesertaUkom = new PesertaUkom()

  inputs: FIleHandler = {
    files: {},
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label
      }
    }
  }

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit () {
    this.getRejectedDokumen()
    this.handleRejectedDokumen()
  }

  getRejectedDokumen () {
    if (this.pendingTask?.dokumenUkomList?.length) {
      this.rejectedDokumen = this.pendingTask.dokumenUkomList.filter(
        dokumen => dokumen.dokumenStatus.toLowerCase() === 'reject'
      )
    } else {
      console.warn('No documents found in pendingTask.dokumenUkomList')
    }
  }

  handleRejectedDokumen () {
    this.inputs.files = {}
    this.rejectedDokumen.forEach((dokumen, index) => {
      const key = `rejectedDokumen_${index + 1}`
      this.inputs.files[key] = {
        label: dokumen.dokumenPersyaratanName || 'Unknown Document'
      }
    })
  }

  isAnyFileMissing (): boolean {
    return Object.keys(this.inputs.files).some(key => {
      return !this.detectedDokumen[key]
    })
  }

  onSave () {
    console.log(this.key)

    if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
      this.pesertaUkom.dokumenUkomList = []
    }

    // for (const key in this.detectedDokumen) {
    //   if (this.detectedDokumen.hasOwnProperty(key)) {
    //     const detected = this.detectedDokumen[key]

    //     this.pesertaUkom.dokumenUkomList.push({
    //       dokumenFile: detected.base64,
    //       dokumenPersyaratanName:
    //         this.pendingTask.nip +
    //         '_' +
    //         'dokumenPersyaratanUkom' +
    //         '_' +
    //         Date.now(),
    //       dokumenPersyaratanId: this.pendingTask.dokumenUkomList.find(
    //         dokumen => dokumen.dokumenPersyaratanName === detected.label
    //       )?.dokumenPersyaratanId
    //     })
    //   }
    // }

    const documentMap = new Map()

    for (const key in this.detectedDokumen) {
      if (this.detectedDokumen.hasOwnProperty(key)) {
        const detected = this.detectedDokumen[key]

        const existingDokumen = this.pendingTask.dokumenUkomList.find(
          dokumen => dokumen.dokumenPersyaratanName === detected.label
        )

        if (existingDokumen) {
          const newDoc = {
            dokumenFile: detected.base64,
            dokumenPersyaratanName: `${
              this.pendingTask.nip
            }_dokumenPersyaratanUkom_${Date.now()}`,
            dokumenPersyaratanId: existingDokumen.dokumenPersyaratanId
          }

          // Store only the latest document for each dokumenPersyaratanId
          documentMap.set(existingDokumen.dokumenPersyaratanId, newDoc)
        }
      }
    }

    // Convert the Map values to an array and assign it to pesertaUkom.dokumenUkomList
    this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

    this.revisedDokumen.id = this.pendingTask.id
    this.revisedDokumen.taskAction = 'approve'
    this.revisedDokumen.object = this.pesertaUkom

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) {
          return
        }
        this.apiService
          .postData(
            `/api/v1/participant_ukom/task/non_jf/submit?key=${this.key}`,
            this.revisedDokumen
          )
          .subscribe({
            next: () => window.location.reload(),
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }
}
