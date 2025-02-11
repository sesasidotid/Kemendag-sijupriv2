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
import { FormsModule } from '@angular/forms'

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
  verified: string
  dokumenVerifikasiUrl: string
}

@Component({
  selector: 'app-rekap-table',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    ModalComponent,
    FileHandlerComponent,
    FormsModule
  ],
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
  action$ = new BehaviorSubject<'APPROVE' | 'REJECT'>('APPROVE')

  comment: string = ''
  commentTouched = false

  pagination = true
  paginationPageSize = 10
  paginationPageSizeSelector = [10, 20, 30, 100]

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
    // {
    //   field: 'verified',
    //   headerName: 'Verified',
    //   filter: true,
    //   floatingFilter: true,
    //   cellStyle: params => {
    //     switch (params.value) {
    //       case 'APPROVE':
    //         return { backgroundColor: '#198754', color: '198754' } // Green for APPROVE
    //       case 'REJECT':
    //         return { backgroundColor: '#dc3545', color: 'dc3545' } // Red for REJECT
    //       case 'PENDING':
    //         return { backgroundColor: '#ffc107', color: 'ffc107' } // Yellow for PENDING
    //       default:
    //         return null // Default style
    //     }
    //   }
    // },

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
    },
    {
      field: 'remark',
      headerName: 'Catatan',
      filter: true,
      floatingFilter: true
    },
    {
      field: 'verified',
      headerName: 'Verified',
      filter: true,
      floatingFilter: true,
      cellStyle: params => {
        switch (params.value) {
          case 'APPROVE':
            return { color: '#198754', fontWeight: 'bold' } // Green text for APPROVE
          case 'REJECT':
            return { color: '#dc3545', fontWeight: 'bold' } // Red text for REJECT
          case 'PENDING':
            return { color: '#ffc107', fontWeight: 'bold' } // Yellow text for PENDING
          default:
            return { fontWeight: 'base' } // Default bold text
        }
      }
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

  sourceFile: string

  constructor (
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private handlerService: HandlerService,
    private alertService: AlertService,
    private filePreviewService: FilePreviewService,
    private sanitizer: DomSanitizer
  ) {
    if (LoginContext.getRoleCodes().includes('USER_EXTERNAL')) {
      this.colDefs.push({
        headerName: 'Dokumen Verifikasi',
        cellRenderer: RekapButtonComponent,
        cellRendererParams: {
          onClickButtonOne: this.toggleModal.bind(this),
          showFirstButton: (data: RekapData) => {
            return (
              (data.verified == 'EMPTY' ||
                data.verified == 'REJECT' ||
                data.verified == 'PENDING') &&
              (data.jenisPengembanganKompetensi ==
                'Seminar/Bimtek/Belajar Mandiri' ||
                data.jenisPengembanganKompetensi == 'Magang')
            )
            // return true
          },
          showSecondButton: (data: RekapData) => {
            return false
          },
          disabledFirstButton: (data: RekapData) => {
            return data.verified == 'PENDING'
          },
          titleFirst: (data: RekapData) => {
            if (data.verified == 'PENDING') {
              return 'Menunggu Verifikasi Admin'
            } else if (data.verified == 'REJECT') {
              return 'Perbaiki Dokumen'
            }
            return 'Upload Verifikasi'
          },
          iconFirst: 'upload',
          colorFirst: (data: RekapData) => {
            if (data.verified == 'REJECT') {
              return 'danger'
            }
            return 'primary'
          }
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
            return (
              data.jenisPengembanganKompetensi ==
                'Seminar/Bimtek/Belajar Mandiri' ||
              data.jenisPengembanganKompetensi == 'Magang'
            )
          },
          disabledFirstButton: (data: RekapData) => {
            return data.verified == 'EMPTY'
          },
          titleFirst: (data: RekapData) => {
            if (data.verified == 'EMPTY') {
              return 'Dokumen Belum Diupload'
            } else if (data.verified == 'REJECT') {
              return 'Menunggu Perbaikan Dokumen oleh User'
            }
            return 'Preview'
          },
          iconFirst: 'eye-outline',
          colorFirst: (data: RekapData) => {
            if (data.verified == 'REJECT') {
              return 'danger'
            }
            return 'primary'
          },

          onClickButtonTwo: this.toggleModal.bind(this),
          showSecondButton: (data: RekapData) => {
            return data.verified == 'PENDING'
            // return true
          },
          disabledSecondButton: (data: RekapData) => {
            return data.verified == 'EMPTY'
            // return false
          },
          titleSecond: (data: RekapData) => {
            if (data.verified == 'PENDING') {
              return 'Verifikasi'
            }
            return 'Verifikasi'
          },
          iconSecond: 'shield-check',
          colorSecond: () => {
            return 'success'
          }
        }
      })
    }
  }

  get sanitizedSource () {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.sourceFile)
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

  verifyDocument (data?: RekapData) {
    this.commentTouched = true
    if (!this.comment && this.action$.value == 'REJECT') {
      return // Prevent saving if remark is empty
    }

    if (!data) {
      console.error('No data provided for verification')
      return
    }

    this.confirmationService.open().subscribe({
      next: result => {
        if (!result.confirmed) return

        const payload = {
          id: data.id.toString(),
          verified: this.action$.value,
          remark: this.comment
        }

        console.log('pppp', payload)
        // return
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
            error: error => {
              console.error('Error verifying document', error)
              this.alertService.showToast('Error', 'Failed to verify document')
            },
            complete: () => {
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }
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
            error: error => {
              console.log(error)
              this.handlerService.handleAlert('Error', 'Upload Failed')
            },
            complete: () => {
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            }
          })
      }
    })
  }
}
