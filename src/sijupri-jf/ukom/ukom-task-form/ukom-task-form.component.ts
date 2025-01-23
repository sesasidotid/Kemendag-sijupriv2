import { DokumenPersyaratan } from './../../../modules/maintenance/models/dokumen-persyaratan.model'
import { CommonModule } from '@angular/common'
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { DokumenUkomPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan-ukom'

@Component({
  selector: 'app-ukom-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './ukom-task-form.component.html',
  styleUrl: './ukom-task-form.component.scss'
})
export class UkomTaskFormComponent {
  @Input() jf: JF
  @Input() ukom: Ukom = new Ukom()
  pesertaUkom: PesertaUkom = new PesertaUkom()

  jabatanList: Jabatan[] = []
  nextJenjang: Jenjang
  detectedDokumen: any = {}

  dokumenPersyaratanList: DokumenUkomPersyaratan[] = []

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
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnChanges (changes: SimpleChanges) {
    if (changes['ukom']) {
      console.log('Ukom changed:', changes['ukom'].currentValue)
    }
    if (changes['jf']) {
      console.log('JF changed:', changes['jf'].currentValue)
    }
  }

  ngOnInit () {}

  getDokumenPersyaratan () {
    console.log('jf', this.jf)
    this.apiService
      .getData(
        `/api/v1/document_ukom/jenis_ukom/${this.pesertaUkom.jenis_ukom}`
      )
      .subscribe({
        next: response => {
          this.dokumenPersyaratanList = response.map((dokumen: any) => {
            return new DokumenUkomPersyaratan({
              dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
              dokumenPersyaratanName: dokumen.dokumenPersyaratanName
            })
          })

          this.detectedDokumen = {}
          this.inputs.files = {}

          this.dokumenPersyaratanList.forEach((dokumen, index) => {
            const key = `dokumenPersyaratan_${index + 1}`
            this.inputs.files[key] = {
              label: dokumen.dokumenPersyaratanName,
              id: dokumen.dokumenPersyaratanId
            }
          })
        },
        error: error => this.handlerService.handleException(error)
      })
  }

  getNextJenjang () {
    this.apiService
      .getData(`/api/v1/jenjang/next/${this.jf.jenjangCode}`)
      .subscribe({
        next: response => {
          this.nextJenjang = new Jenjang(response)
          this.pesertaUkom.nextJenjangCode = this.nextJenjang.code
        },
        error: error => this.handlerService.handleException(error)
      })
  }

  getListJabatan () {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: response =>
        (this.jabatanList = response.map(
          (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
        )),
      error: error => this.handlerService.handleException(error)
    })
  }

  onJenisUkomSwitch (event: Event) {
    const jenis_ukom = (event.target as HTMLSelectElement).value
    console.log('Jenis Ukom changed to:', jenis_ukom)

    this.pesertaUkom.nextJabatanCode = null
    this.pesertaUkom.nextJenjangCode = null

    if (jenis_ukom) {
      this.pesertaUkom.jenis_ukom = jenis_ukom

      if (jenis_ukom == 'PERPINDAHAN_JABATAN') {
        this.getListJabatan()
        this.getDokumenPersyaratan()
      }

      if (jenis_ukom == 'KENAIKAN_JENJANG') {
        this.getNextJenjang()
        this.getDokumenPersyaratan()
      }
    }
  }

  submit () {
    if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
      this.pesertaUkom.dokumenUkomList = []
    }
    for (const key in this.detectedDokumen) {
      if (this.detectedDokumen.hasOwnProperty(key)) {
        const detected = this.detectedDokumen[key]
        this.pesertaUkom.dokumenUkomList.push({
          dokumenFile: detected.base64,
          //   dokumenPersyaratanName: this.jf.nip + '_' + 'dokumenPersyaratanUkom'
          dokumenPersyaratanName:
            this.dokumenPersyaratanList.find(
              dokumen => dokumen.dokumenPersyaratanName == detected.label
            ).dokumenPersyaratanName +
            '_' +
            this.jf.nip +
            '_' +
            Date.now(),
          dokumenPersyaratanId: detected.id
        })
      }
    }

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.pesertaUkom.nip = this.jf.nip
        if (this.pesertaUkom.jenis_ukom == 'PERPINDAHAN_JABATAN') {
          this.pesertaUkom.nextJabatanCode = this.pesertaUkom.nextJabatanCode
          this.pesertaUkom.nextJenjangCode = this.jf.jenjangCode
        }

        if (this.pesertaUkom.jenis_ukom == 'KENAIKAN_JENJANG') {
          this.pesertaUkom.nextJenjangCode = this.pesertaUkom.nextJenjangCode
          this.pesertaUkom.nextJabatanCode = this.jf.jabatanCode
        }
        this.pesertaUkom.nextPangkatCode = this.jf.pangkatCode
        this.pesertaUkom.password = 'password'

        console.log('pesertaUkom', this.pesertaUkom)
        this.apiService
          .postData(`/api/v1/participant_ukom/task/jf`, this.pesertaUkom)
          .subscribe({
            next: () => window.location.reload(),
            error: error => this.handlerService.handleException(error)
          })
      },
      error: error => {
        console.log('error', error)
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }
}
