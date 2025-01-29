import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { ColDef } from 'ag-grid-community'
import { AgGridAngular } from 'ag-grid-angular'
import { BehaviorSubject, timeout } from 'rxjs'
import { ModalComponent } from '../modal/modal.component'
import { RekapButtonComponent } from './rekap-button.component'
import { LoginContext } from '../../commons/login-context'
import { color } from '../../../../assets/NiceAdmin/vendor/chart.js/helpers'
import { FIleHandler } from '../../commons/file-handler/file-handler'
import { FileHandlerComponent } from '../file-handler/file-handler.component'
import { ConfirmationService } from '../../services/confirmation.service'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
import { ApiService } from '../../services/api.service'
import { HandlerService } from '../../services/handler.service'
import { AlertService } from '../../services/alert.service'
import { FilePreviewService } from '../../services/file-preview.service'
import { DomSanitizer } from '@angular/platform-browser'

interface RekapData {
  dokumenVerifikasi: string | null
  id: number
  jenisPengembanganKompetensi: string
  kategori: string
  keterangan: string
  matrixId: number
  pelatihanTeknisId: string
  pelatihanTeknisName: string
  penyebabDiskrepansiUtama: string
  pertanyaanId: number
  pertanyaanName: string
  rankPrioritas: string
  verified: boolean
  dokumenVerifikasiUrl: string
}

@Component({
  selector: 'app-rekap-table',
  standalone: true,
  imports: [CommonModule, AgGridAngular, ModalComponent, FileHandlerComponent],
  templateUrl: './rekap-table.component.html',
  styleUrl: './rekap-table.component.scss'
})
export class RekapTableComponent {
  @Input() data: RekapData[] = []

  dokumentImport: {
    id?: string
    fileDokumenVerifikasi?: string
  } = {}
  role = LoginContext.getRoleCodes()

  isModalOpen$ = new BehaviorSubject<boolean>(false)
  isModalPreviewOpen$ = new BehaviorSubject<boolean>(false)
  selectedRekapId$ = new BehaviorSubject<number | null>(null)

  selectedRekapData: RekapData

  pagination = true
  paginationPageSize = 10
  paginationPageSizeSelector = [10, 20, 30, 100]

  // Column Definitions: Defines the columns to be displayed.
  // pertanyaan_name, keterangan, 'kategori', 'penyebabDiskrepansiUtama'. 'jenisPengembanganKompetensi', 'rankPrioritas', 'dokumenVerifikasiUrl (preview), 'verified (true sama false ini klo dah di verifikasi kasih centang atau status gitu aja keknya)
  colDefs: ColDef[] = [
    {
      field: 'pertanyaanName',
      headerName: 'Pertanyaan',
      filter: true,
      floatingFilter: true,
      filterParams: { filterOptions: ['contains'] },
      initialWidth: 600
    },
    {
      field: 'keterangan',
      headerName: 'Keterangan',
      filter: true,
      floatingFilter: true
    },
    {
      field: 'kategori',
      headerName: 'Kategori',
      filter: true,
      floatingFilter: true
    },
    {
      field: 'penyebabDiskrepansiUtama',
      headerName: 'Penyebab Diskrepansi Utama',
      filter: true,
      floatingFilter: true
    },
    {
      field: 'rankPrioritas',
      headerName: 'Rank Prioritas',
      filter: true,
      floatingFilter: true
      //   cellStyle: { textAlign: 'center' }
    },
    // {
    //   field: 'dokumenVerifikasi',
    //   headerName: 'Dokumen Verifikasi',
    //   filter: true,
    //   floatingFilter: true
    // },
    {
      field: 'verified',
      headerName: 'Verified',
      filter: true,
      floatingFilter: true
      //   cellStyle: {
      //     display: 'flex',
      //     justifyContent: 'center',
      //     alignItems: 'center'
      //   }
    },
    {
      field: 'jenisPengembanganKompetensi',
      headerName: 'Jenis Pengembangan Kompetensi',
      filter: true,
      floatingFilter: true,
      initialWidth: 400
    },
    {
      field: 'pelatihanTeknisName',
      headerName: 'Pelatihan Teknis',
      filter: true,
      floatingFilter: true
    }
  ]

  inputs: FIleHandler = {
    files: {
      dokumentFile: { label: 'Dokumen Verifikasi' }
    },
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      this.dokumentImport.id = this.selectedRekapId$.value.toString()
      this.dokumentImport.fileDokumenVerifikasi = base64Data
    }
  }

  //   sourceFile: string =
  //     'https://drive.google.com/file/d/1Nj7PXf3U_T4BXoAn1RTRqCoQ4LMMikjI/preview'
  sourceFile: string

  constructor (
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private handlerService: HandlerService,
    private alertService: AlertService,
    private filePreviewService: FilePreviewService,
    private sanitizer: DomSanitizer // Inject the sanitizer
  ) {
    if (LoginContext.getRoleCodes().includes('USER_EXTERNAL')) {
      this.colDefs.push({
        headerName: 'Dokumen Verifikasi',
        cellRenderer: RekapButtonComponent,
        cellRendererParams: {
          onClickButtonOne: this.toggleModal.bind(this),
          // onClikButtonTwo: this.toggleModal.bind(this),
          showFirstButton: (data: RekapData) => {
            return (
              //   data.jenisPengembanganKompetensi ===
              //     'Seminar/Bimtek/Belajar Mandiri' ||
              //   data.jenisPengembanganKompetensi === 'Magang' ||
              //   data.verified === false
              !data.verified && // Ensure it's not verified
              (data.jenisPengembanganKompetensi ===
                'Seminar/Bimtek/Belajar Mandiri' ||
                data.jenisPengembanganKompetensi === 'Magang')
            )
          },
          showSecondButton: (data: RekapData) => {
            return false
          },
          disabledFirstButton: (data: RekapData) => {
            return false
          },
          titleFirst: 'Upload Verifikasi',
          iconFirst: 'upload',
          colorFirst: 'primary'
        }
      })
    }

    if (LoginContext.getRoleCodes().includes('ADMIN')) {
      this.colDefs.push({
        headerName: 'Dokumen Verifikasi',
        cellRenderer: RekapButtonComponent,
        cellRendererParams: {
          onClickButtonOne: this.toggleModalPreview.bind(this),
          showFirstButton: (data: RekapData) => {
            return data.dokumenVerifikasi !== null
          },

          disabledFirstButton: (data: RekapData) => {
            return false
          },

          titleFirst: 'Preview',
          iconFirst: 'eye-outline',
          colorFirst: 'primary',
          onClikButtonTwo: this.verifyDocument.bind(this),

          showSecondButton: (data: RekapData) => {
            return (
              data.verified === false &&
              data.jenisPengembanganKompetensi !== 'Pelatihan Teknis'
            )
          },
          disabledSecondButton: (data: RekapData) => {
            return false
          },

          titleSecond: 'Verifikasi',
          iconSecond: 'shield-check',
          colorSecond: 'success'
        }
      })
    }
  }

  get sanitizedSource () {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.sourceFile)
  }

  openLink (data?: RekapData): void {
    // window.open(data.dokumenVerifikasi, '_blank')
    window.open('google.com', '_blank')
  }

  toggleModal (data?: RekapData) {
    if (data) {
      this.selectedRekapId$.next(Number(data.id))
      this.selectedRekapData = data
      console.log(this.selectedRekapData)
    }
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  toggleModalPreview (data?: RekapData) {
    // if (data) {
    //   this.selectedRekapId$.next(Number(data.id))
    //   this.selectedRekapData = data
    //   console.log(this.selectedRekapData)
    // }
    // this.isModalPreviewOpen$.next(!this.isModalPreviewOpen$.value)

    // this.sourceFile = this.sourceFile
    console.log('data', data)
    this.filePreviewService.open(
      data.dokumenVerifikasi,
      data.dokumenVerifikasiUrl
    )
  }

  //   toggleModalPreview (fileName: string, source: string) {
  //     this.filePreviewService.open(fileName, source)
  //   }

  verifyDocument (data?: RekapData) {
    if (!data) {
      console.error('No data provided for verification')
      return
    }

    this.confirmationService.open().subscribe({
      next: result => {
        if (!result.confirmed) return

        const payload = {
          id: data.id.toString(),
          verified: true
        }

        this.apiService
          .postData(
            '/api/v1/akp_pelatihan_teknis/validate/dokumen_verifikasi',
            payload
          )
          .subscribe({
            next: () => {
              this.alertService.showToast('Success', 'Verification successful')
              this.isModalOpen$.next(false)
            },
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        console.log('dokumenImport', this.dokumentImport)
        this.apiService
          .postData(
            '/api/v1/akp_pelatihan_teknis/upload/dokumen_verifikasi',
            this.dokumentImport
          )
          .subscribe({
            next: response => {
              this.alertService.showToast('Success', 'Upload Success')
              this.isModalOpen$.next(!this.isModalOpen$.value)
            },
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }

  //   openModal () {
  //     this.isModalPreviewOpen$.next(true)
  //   }

  //   // Method to close the modal
  //   closeModal () {
  //     this.showModal = false
  //   }

  ngOnInit () {}
}
