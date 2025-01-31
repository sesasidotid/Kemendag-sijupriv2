import { JenisUkom } from '../../../../modules/ukom/models/jenis-ukom'
import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Router, RouterLink } from '@angular/router'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { Ukom } from '../../../../modules/ukom/models/ukom.model'
import { TabService } from '../../../../modules/base/services/tab.service'
import { LoginContext } from '../../../../modules/base/commons/login-context'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'app-ukom-list',
  standalone: true,
  imports: [PagableComponent, RouterLink],
  templateUrl: './ukom-list.component.html',
  styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
  //   ukom: Ukom = new Ukom()
  ukom: any = {}
  editorContent: string = ''
  init: any
  pagable: Pagable

  jenisUkomMap: Record<string, string> = {}

  constructor (
    private apiService: ApiService,
    private allertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.pagable = new PagableBuilder('/api/v1/participant_ukom/search')
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis Ukom', (data: any) =>
            data.jenisUkom === 'KENAIKAN_JENJANG'
              ? 'Kenaikan Jenjang'
              : data.jenisUkom === 'PERPINDAHAN_JABATAN'
              ? 'Perpindahan Jabatan'
              : data.jenisUkom
          )
          .build()
      )
      //   .addPrimaryColumn(
      //     new PrimaryColumnBuilder('Tanggal', 'lastUpdated').build()
      //   )
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Status', (data: any) =>
            data.ukomBan != null ? 'Banned' : 'Active'
          )
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.router.navigate([`/ukom/ukom-list/${ukom.nip}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('nip')
          .withField('NIP', 'text')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('like')
          .setProperty('name')
          .withField('Nama', 'text')
          .build()
      )
      .build()
  }

  ngOnInit () {}

  handleImageUpload = (blobInfo: any, progress: Function) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(blobInfo.blob())

      reader.onprogress = e => {
        progress((e.loaded / e.total) * 100)
      }

      reader.onload = () => {
        resolve(reader.result)
      }

      reader.onerror = error => {
        console.error('Image to Base64 failed', error)
        reject('Image upload failed')
      }
    })

  onEditorChange (content: any) {
    this.editorContent = content
  }

  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService.postData('/api/v1/ukom', this.ukom).subscribe({
          next: response => {
            console.log('Success:', response)
          },
          error: error => {
            console.error('Error:', error)
            this.allertService.showToast('Error', 'gagal mengirimkan informasi')
          }
        })
      }
    })
  }
}
