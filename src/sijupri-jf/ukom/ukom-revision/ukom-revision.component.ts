import { DokumenUkomList } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { CommonModule } from '@angular/common'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { DokumenUkomPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { switchMap } from 'rxjs'
import { RevisiDokumenUkom } from '../../../modules/ukom/models/revisi-dokumen-ukom.model'
@Component({
  selector: 'app-ukom-revision',
  standalone: true,
  imports: [CommonModule, FileHandlerComponent],
  templateUrl: './ukom-revision.component.html',
  styleUrl: './ukom-revision.component.scss'
})
export class UkomRevisionComponent {
  @Input() jf: JF
  @Input() ukom: Ukom = new Ukom()
  @Input() pendingTask: UkomTaskDetail = new UkomTaskDetail()

  pesertaUkom: PesertaUkom = new PesertaUkom()
  revisedDokumen: RevisiDokumenUkom = new RevisiDokumenUkom()

  jabatanList: Jabatan[] = []
  nextJenjang: Jenjang
  detectedDokumen: any = {}

  dokumenPersyaratanList: DokumenUkomPersyaratan[] = []
  rejectedDokumen: any[] = []

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
    if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
      this.pesertaUkom.dokumenUkomList = []
    }

    // for (const key in this.detectedDokumen) {
    //   if (this.detectedDokumen.hasOwnProperty(key)) {
    //     const detected = this.detectedDokumen[key]

    //     this.pesertaUkom.dokumenUkomList.push({
    //       dokumenFile: detected.base64,
    //       dokumenPersyaratanName:
    //         this.jf.nip + '_' + 'dokumenPersyaratanUkom' + '_' + Date.now(),
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
              this.jf.nip
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

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        // this.pesertaUkom.nip = this.jf.nip

        // if (this.pendingTask.jenisUkom == 'PERPINDAHAN_JABATAN') {
        //   this.pesertaUkom.jenis_ukom = this.pendingTask.jenisUkom
        //   this.pesertaUkom.nextJabatanCode = this.pendingTask.nextJabatanCode
        //   this.pesertaUkom.nextJenjangCode = this.pendingTask.jenjangCode
        // }

        // if (this.pendingTask.jenisUkom == 'KENAIKAN_JENJANG') {
        //   this.pesertaUkom.jenis_ukom = this.pendingTask.jenisUkom
        //   this.pesertaUkom.nextJenjangCode = this.pendingTask.nextJenjangCode
        // }

        // this.pesertaUkom.nextPangkatCode = this.pendingTask.nextPangkatCode
        // this.pesertaUkom.password = 'password'

        this.revisedDokumen.id = this.pendingTask.id
        this.revisedDokumen.taskAction = 'approve'
        this.revisedDokumen.object = this.pesertaUkom

        console.log(this.pesertaUkom)
        console.log(this.revisedDokumen)

        this.apiService
          .postData(`/api/v1/participant_ukom/task/submit`, this.revisedDokumen)
          .subscribe({
            next: () => window.location.reload(),
            error: error => this.handlerService.handleException(error)
          })
      },
      error: error => {
        console.log('error', error)
      }
    })
  }
}
