import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DokumenPersyaratan } from '../../../modules/maintenance/models/dokumen-persyaratan.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { HandlerService } from '../../../modules/base/services/handler.service'
@Component({
  selector: 'app-formasi-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PagableComponent],
  templateUrl: './formasi-document-list.component.html',
  styleUrl: './formasi-document-list.component.scss'
})
export class FormasiDocumentListComponent {
  dokumenPersyaratan: DokumenPersyaratan = new DokumenPersyaratan()
  dokumenPersyaratanList: DokumenPersyaratan[] = []
  pagable: Pagable
  refresh: boolean = false

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService
  ) {
    this.pagable = new PagableBuilder(
      '/api/v1/doc_persyaratan/association/for_formasi'
    )
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((item: any) => {
            this.delete(item.id)
          }, 'danger')
          .withIcon('danger')
          .build()
      )
      .build()
  }

  ngOnInit () {
    this.getDokumentPersyaratanList()
  }

  getDokumentPersyaratanList () {
    this.apiService
      .getData(`/api/v1/doc_persyaratan/association/for_formasi`)
      .subscribe({
        next: (dokumenPersyaratanList: DokumenPersyaratan[]) =>
          (this.dokumenPersyaratanList = dokumenPersyaratanList),
        error: error => {
          console.error('Error fetching data', error)
          this.alertService.showToast('Error', error.message)
          throw error
        }
      })
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.dokumenPersyaratan.association = 'for_formasi'

        this.apiService
          .postData(`/api/v1/doc_persyaratan`, this.dokumenPersyaratan)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              this.refresh = !this.refresh
            },
            error: error => {
              console.error('Error fetching data', error)
              this.alertService.showToast('Error', 'Gagal menyimpan data')
            }
          })
      }
    })
  }

  delete (id: string) {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService.deleteData(`/api/v1/doc_persyaratan/${id}`).subscribe({
          next: () => {
            this.handlerService.handleAlert('Success', 'Data berhasil dihapus')
            this.refresh = !this.refresh
          },
          error: error => {
            console.error('Error fetching data', error)
            this.alertService.showToast('Error', 'Gagal menghapus data')
          }
        })
      }
    })
  }
}
