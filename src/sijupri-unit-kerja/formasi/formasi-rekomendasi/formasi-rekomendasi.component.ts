import { ProcessFormasi } from './../../../modules/formasi/models/formasi-process.model'
import { Component } from '@angular/core'
import { LoginContext } from '../../../modules/base/commons/login-context'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { ConverterService } from './../../../modules/base/services/converter.service'
import { Router } from '@angular/router'
@Component({
  selector: 'app-formasi-rekomendasi',
  standalone: true,
  imports: [PagableComponent, ModalComponent, CommonModule],
  templateUrl: './formasi-rekomendasi.component.html',
  styleUrl: './formasi-rekomendasi.component.scss'
})
export class FormasiRekomendasiComponent {
  unitKerjaId: string = ''
  pagable: Pagable
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  ProcessFormasi: ProcessFormasi = new ProcessFormasi()

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private filePreviewService: FilePreviewService,
    private converterService: ConverterService,
    private router: Router
  ) {
    this.unitKerjaId = LoginContext.getUnitKerjaId()

    this.pagable = new PagableBuilder(`/api/v1/formasi/search`)
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal Pengajuan', 'dateCreated').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'formasiStatus').build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('unitKerjaId')
          .withDefaultValue(this.unitKerjaId)
          .build()
      )
      //   .addActionColumn(
      //     new ActionColumnBuilder()
      //       .withIcon('detail')
      //       .setAction((formasi: any) => {
      //         this.getDetail(formasi.id)
      //         this.toggleModal()
      //       }, 'primary')
      //       .build()
      //   )
      .addActionColumn(
        new ActionColumnBuilder()
          .withIcon('detail')
          .setAction((formasi: any) => {
            this.router.navigate([`/formasi/formasi-rekomendasi/${formasi.id}`])
          }, 'info')
          .build()
      )
      .build()
  }

  convertDate (date: string) {
    return this.converterService.dateToHumanReadable(date)
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  getDetail (formasi_id: string) {
    this.apiService
      .getData(`/api/v1/formasi_proses/search?eq_formasiId=${formasi_id}`)
      .subscribe({
        next: response => {
          this.ProcessFormasi = response.data[0]
        },
        error: error => {
          this.handlerService.handleAlert(
            'Error',
            'Gagal mengambil data formasi'
          )
        }
      })
  }

  previewFile (fileName: string, fileSource: string) {
    this.filePreviewService.open(fileName, fileSource)
  }
}
