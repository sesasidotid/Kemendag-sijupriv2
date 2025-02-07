import { Component, Input } from '@angular/core'
import { DokumenPersyaratanService } from '../../../../modules/maintenance/services/dokumen-persyaratan.service'
import { DokumenPersyaratan } from '../../../../modules/maintenance/models/dokumen-persyaratan.model'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { FormasiService } from '../../../../modules/formasi/services/formasi.service'
import { FormasiRequest } from '../../../../modules/formasi/models/formasi-request.model'
import { FormasiDokumen } from '../../../../modules/formasi/models/formasi-dokumen.model'
import { take } from 'rxjs'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { ObjectTaskService } from '../../../../modules/workflow/services/object-task.service'
import { ObjectTask } from '../../../../modules/workflow/models/object-task.model'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { FormasiDokumenRequirement } from '../../../../modules/formasi/models/formasi-dokumen-requirement.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { DokumenUkomPersyaratan } from '../../../../modules/maintenance/models/dokumen-persyaratan-ukom'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { ConfirmationDialogComponent } from '../../../../modules/base/components/confirmation-dialog/confirmation-dialog.component'

@Component({
  selector: 'app-formasi-dokumen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileHandlerComponent,
    ConfirmationDialogComponent
  ],
  templateUrl: './formasi-dokumen.component.html',
  styleUrl: './formasi-dokumen.component.scss'
})
export class FormasiDokumenComponent {
  formasiDokumenList: DokumenUkomPersyaratan[] = []
  formasiRequest: FormasiRequest = new FormasiRequest()
  detectedDokumen: any = {}

  payload: {
    formasiDokumenList: {
      dokumenFile: string
      dokumenPersyaratanName: string
      dokumenPersyaratanId: string
    }[]
  } = {
    formasiDokumenList: []
  }

  @Input() objectTaskId: string

  inputs: FIleHandler = {
    files: {},
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string,
      id: string
    ) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label,
        id: id
      }
    }
  }

  constructor (
    private formasiService: FormasiService,
    private dokumenPersyaratan: DokumenPersyaratanService,
    private objectTaskService: ObjectTaskService,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {}

  ngOnInit () {
    if (this.objectTaskId) {
      this.getDokumenPersyaratanListFromObjecTask()
    } else {
      this.getDokumenPersyaratanList()
    }
  }

  getDokumenPersyaratanList () {
    this.apiService.getData('/api/v1/formasi_dokumen/all').subscribe({
      next: response => {
        this.formasiDokumenList = response.map(
          (dokumen: FormasiDokumenRequirement) => {
            return new DokumenUkomPersyaratan({
              dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
              dokumenPersyaratanName: dokumen.dokumenPersyaratanName
            })
          }
        )

        this.detectedDokumen = {}
        this.inputs.files = {}

        this.formasiDokumenList.forEach((dokumen, index) => {
          const key = `dokumenPersyaratan_${index + 1}`
          this.inputs.files[key] = {
            label: dokumen.dokumenPersyaratanName,
            id: dokumen.dokumenPersyaratanId
          }
        })
      },
      error: error => {
        console.error(error)
      }
    })
  }

  getDokumenPersyaratanListFromObjecTask () {
    this.objectTaskService.findById(this.objectTaskId).subscribe({
      next: (objectTask: ObjectTask) => {
        this.formasiDokumenList.length = 0
        const dokumenPersyaratanList = objectTask.object
        for (const dokumenPersyaratan of dokumenPersyaratanList) {
          this.formasiDokumenList.push(dokumenPersyaratan)
        }
      }
    })
  }

  isAnyFileMissing (): boolean {
    return Object.keys(this.inputs.files).some(key => {
      return !this.detectedDokumen[key]
    })
  }

  submit () {
    const documentMap = new Map()

    for (const key in this.detectedDokumen) {
      if (this.detectedDokumen.hasOwnProperty(key)) {
        const detected = this.detectedDokumen[key]

        const dokumenPersyaratan = this.formasiDokumenList.find(
          dokumen => dokumen.dokumenPersyaratanName == detected.label
        )

        if (dokumenPersyaratan) {
          const newDoc = {
            dokumenFile: detected.base64,
            dokumenPersyaratanName:
              dokumenPersyaratan.dokumenPersyaratanName + '__' + Date.now(),
            dokumenPersyaratanId: detected.id
          }

          // Always store the latest document by overwriting existing ones
          documentMap.set(detected.id, newDoc)
        }
      }
    }

    // Convert the Map values to an array and assign it to payload.formasiDokumenList
    this.payload.formasiDokumenList = Array.from(documentMap.values())
    console.log('payload', this.payload)

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        console.log('payload2', this.payload)

        this.apiService
          .postData(`/api/v1/formasi/task`, this.payload)
          .subscribe({
            next: () => (
              console.log('payload3', this.payload), window.location.reload()
            ),
            error: error => (
              this.handlerService.handleException(error),
              console.log('payload4', this.payload),
              (this.payload = { formasiDokumenList: [] }),
              (this.detectedDokumen = {})
            )
          })
      },
      error: error => {
        console.log('error', error)
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }
}
