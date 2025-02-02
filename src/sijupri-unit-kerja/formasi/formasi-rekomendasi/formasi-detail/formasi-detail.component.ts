import { FilePreviewService } from './../../../../modules/base/services/file-preview.service'
import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { FormasiDetail } from '../../../../modules/formasi/models/formasi-detail.model'
import { ActivatedRoute } from '@angular/router'
@Component({
  selector: 'app-formasi-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formasi-detail.component.html',
  styleUrl: './formasi-detail.component.scss'
})
export class FormasiDetailComponent {
  formasiId: string = ''
  formasiDetail: FormasiDetail = new FormasiDetail()

  constructor (
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private handlerService: HandlerService,
    private filePreviewService: FilePreviewService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.formasiId = params.get('formasiId')
    })

    this.getRekomendasiFormasiDetail()
  }

  getTotalRekapitulasi (): number {
    let total = 0
    this.formasiDetail.formasiDetailDtoList.forEach(item => {
      item.formasiResultDtoList.forEach(formasi => {
        total += formasi.pembulatan || 0
      })
    })
    return total
  }

  getRekomendasiFormasiDetail () {
    this.apiService.getData(`/api/v1/formasi/${this.formasiId}`).subscribe({
      next: res => {
        this.formasiDetail = res
        console.log('Formasi Detail', this.formasiDetail)
      },
      error: err => {
        console.log('Error', err)
        this.handlerService.handleAlert('Error', 'Gagal mengambil data formasi')
      }
    })
  }

  preview (fileName: string, source: string) {
    this.filePreviewService.open(fileName, source)
  }
}
