import { Component } from '@angular/core'
import { TabService } from '../../../modules/base/services/tab.service'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { CommonModule } from '@angular/common'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'

@Component({
  selector: 'app-akp-verifikasi-pelatihan',
  standalone: true,
  imports: [
    CommonModule,
    FileHandlerComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './akp-verifikasi-pelatihan.component.html',
  styleUrl: './akp-verifikasi-pelatihan.component.scss'
})
export class AkpVerifikasiPelatihanComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  isLoading$ = new BehaviorSubject<boolean>(false)

  fileValidasiNilai: FormGroup

  payload: {
    file_dokumen_verifikasi?: string
  } = {}

  inputs: FIleHandler = {
    files: {
      nilai_template: { label: 'Upload Nilai Pelatihan Teknis' }
    },
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      switch (key) {
        case 'nilai_template':
          this.payload.file_dokumen_verifikasi = base64Data
          break
      }
    }
  }

  constructor (
    private tabService: TabService,
    private router: Router,
    private apiService: ApiService,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService
  ) {
    setTimeout(() => {}, 0)
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService.addTab({
      label: 'Template File',
      isActive: true,
      icon: 'mdi-file-download',
      onClick: () => this.handleDownloadTemplate()
    })
  }

  handleDownloadTemplate () {
    this.apiService
      .getDownload('/api/v1/akp_pelatihan_teknis/download/pelatihan')
      .subscribe({
        error: err =>
          this.handlerService.handleAlert('Error', 'Gagal mengunduh template ')
      })
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.isLoading$.next(true)
        this.apiService
          .postData(
            '/api/v1/akp_pelatihan_teknis/validate/pelatihan',
            this.payload
          )
          .subscribe({
            next: response => {
              this.handlerService.handleAlert(
                'Success',
                'Berhasil mengunggah nilai'
              )
              this.payload.file_dokumen_verifikasi = undefined
              this.isLoading$.next(false)

              setTimeout(() => {
                window.location.reload()
              }, 1000)
            },
            error: error => {
              console.log('error', error)
              this.handlerService.handleAlert('Error', 'Gagal mengunggah nilai')
              this.isLoading$.next(false)
            }
          })
      }
    })
  }
}
