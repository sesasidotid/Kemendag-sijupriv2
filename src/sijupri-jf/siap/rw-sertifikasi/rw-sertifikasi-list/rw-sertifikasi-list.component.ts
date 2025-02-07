import { Component, Input } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { RWSertifikasi } from '../../../../modules/siap/models/rw-sertifikasi.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { BehaviorSubject } from 'rxjs'
import { FilePreviewService } from '../../../../modules/base/services/file-preview.service'

@Component({
  selector: 'app-rw-sertifikasi-list',
  standalone: true,
  imports: [PagableComponent, CommonModule, FileHandlerComponent],
  templateUrl: './rw-sertifikasi-list.component.html',
  styleUrl: './rw-sertifikasi-list.component.scss'
})
export class RwSertifikasiListComponent {
  @Input() nip?: string = ''
  apiUrl: string = '/api/v1/rw_sertifikasi/search'

  pagable: Pagable
  isDetailOpen: boolean = false
  rwSertifikasi: RWSertifikasi = new RWSertifikasi()

  loading$ = new BehaviorSubject<boolean>(true)

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private filePreviewService: FilePreviewService
  ) {
    console.log('nip', this.nip)
  }

  ngOnInit () {
    this.apiUrl =
      this.nip === ''
        ? '/api/v1/rw_sertifikasi/search'
        : `/api/v1/rw_sertifikasi/search?eq_nip=${this.nip}`

    this.pagable = new PagableBuilder(this.apiUrl)
      .addPrimaryColumn(new PrimaryColumnBuilder('No. SK', 'noSk').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Tgl SK', 'tglSk').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Wilayah Kerja', 'wilayahKerja').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tgl Mulai', 'dateStart').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tgl Selesai', 'dateEnd').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('UU Kawalan', 'uuKawalan').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((rwSertifikasi: any) => {
            this.getRWSertifikasi(rwSertifikasi.id)
            this.isDetailOpen = true
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('noSk')
          .withField('No. SK', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('tglSk')
          .withField('Tgl SK', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('wilayahKerja')
          .withField('Wilayah Kerja', 'text')
          .build()
      )
      .build()
  }

  getRWSertifikasi (id: string) {
    this.loading$.next(true)
    this.apiService.getData(`/api/v1/rw_sertifikasi/${id}`).subscribe({
      next: response => {
        this.rwSertifikasi = new RWSertifikasi(response)
        this.loading$.next(false)
      },
      error: error => {
        console.log('error', error)
        this.alertService.showToast('Error', 'Gaagal mendapatkan data riwayat')
        this.loading$.next(false)
      }
    })
  }

  preview (fileName: string, fileSource: string) {
    this.filePreviewService.open(fileName, fileSource)
  }

  back () {
    this.isDetailOpen = false
    this.rwSertifikasi = new RWSertifikasi()
  }

  visibility () {
    return () => this.rwSertifikasi.kategoriSertifikasiValue == 2
  }
}
