import { ApiService } from './../../../modules/base/services/api.service'
import { Component } from '@angular/core'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { ActivatedRoute } from '@angular/router'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { FormasiDetail } from '../../../modules/formasi/models/formasi-detail.model'
// import { FormasiDetailComponent } from './formasi/formasi-rekomendasi/formasi-detail/formasi-detail.component.ts'
import { FormasiDetailComponent } from '../../../sijupri-unit-kerja/formasi/formasi-rekomendasi/formasi-detail/formasi-detail.component'
@Component({
  selector: 'app-formasi-data-rekomendasi-detail',
  standalone: true,
  imports: [FormasiDetailComponent],
  templateUrl: './formasi-data-rekomendasi-detail.component.html',
  styleUrl: './formasi-data-rekomendasi-detail.component.scss'
})
export class FormasiDataRekomendasiDetailComponent {
  formasiId: string = ''
  formasiDetail: FormasiDetail = new FormasiDetail()

  constructor (
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.formasiId = params['id']
    })
  }

  ngOnInit () {}

  getFormasiDetail () {
    this.apiService.getData(`/api/v1/formasi/${this.formasiId}`).subscribe({
      next: (response: any) => {
        this.formasiDetail = new FormasiDetail(response)
      },
      error: (error: any) => {
        console.log(error)
        this.handlerService.handleAlert('Error', 'Gagal mengambil data')
      }
    })
  }
}
