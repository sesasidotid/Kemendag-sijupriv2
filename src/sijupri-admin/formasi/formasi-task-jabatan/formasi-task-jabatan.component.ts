import { Component, ViewChild } from '@angular/core'
import { Jabatan } from '../../../modules/maintenance/models/jabatan.model'
import { FormasiUnsur } from '../../../modules/formasi/models/formasi-unsur.model'
import { FormasiResult } from '../../../modules/formasi/models/formasi-result.model'
import { FormasiRequest } from '../../../modules/formasi/models/formasi-request.model'
import { ConfirmationDialogComponent } from '../../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { FormasiService } from '../../../modules/formasi/services/formasi.service'
import { PendingFormasiService } from '../../../modules/formasi/services/pending-formasi.service'
import { JabatanService } from '../../../modules/maintenance/services/jabatan.service'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertService } from '../../../modules/base/services/alert.service'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ResultRecommened } from '../../../modules/formasi/models/formasi-result-recom.model'
@Component({
  selector: 'app-formasi-task-jabatan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formasi-task-jabatan.component.html',
  styleUrl: './formasi-task-jabatan.component.scss'
})
export class FormasiTaskJabatanComponent {
  isModalOpen = false
  jabatanCode: string
  formasiId: string
  jabatan: Jabatan = new Jabatan()

  formasiUnsurList: FormasiUnsur[] = []
  formasiResultList: FormasiResult[] = []
  unsurVolumeData: { [key: string]: { volume: number } } = {}

  resultRecommened: ResultRecommened = new ResultRecommened()
  unsurList: any[] = []
  formasiRequest: FormasiRequest = new FormasiRequest()

  @ViewChild(ConfirmationDialogComponent, { static: false })
  confirmationDialog!: ConfirmationDialogComponent

  constructor (
    private formasiService: FormasiService,
    private pendingFormasiService: PendingFormasiService,
    private jabatanService: JabatanService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.formasiId = params.get('formasi_id')
      this.jabatanCode = params.get('jabatanCode')
    })
  }

  ngOnInit () {
    this.getFormasiObjectTask()
  }

  getFormasiObjectTask () {
    this.getJabatan()
    this.getFormasiTree()
    this.getResultRecommened()
  }

  getResultRecommened () {
    this.apiService
      .getData(`/api/v1/formasi_detail/formasi/${this.formasiId}`)
      .subscribe({
        next: (res: ResultRecommened) => {
          this.resultRecommened = res
          console.log('q', this.resultRecommened)
        }
      })
  }

  getFormasiTree () {
    this.apiService
      .getData(
        `/api/v1/formasi_detail/unsur/tree/${this.formasiId}/${this.jabatanCode}`
      )
      .subscribe({
        next: (formasiUnsurList: FormasiUnsur[]) => {
          this.formasiUnsurList = formasiUnsurList
        },
        error: error => {
          this.handlerService.handleAlert('Error', 'Data tidak ditemukan')
        }
      })
    // this.pendingFormasiService
    //   .findTree(this.formasiId, this.jabatanCode)
    //   .subscribe({
    //     next: (formasiUnsurList: FormasiUnsur[]) =>
    //       (this.formasiUnsurList = formasiUnsurList)
    //   })
  }

  getJabatan () {
    this.jabatanService.findById(this.jabatanCode).subscribe({
      next: (jabatan: Jabatan) => (this.jabatan = jabatan)
    })
  }

  initiate (formasiUnsur: FormasiUnsur) {
    if (!this.unsurVolumeData[formasiUnsur.id]) {
      this.unsurVolumeData[formasiUnsur.id] = {
        volume: formasiUnsur.volume || 0
      }
    }

    return true
  }

  totalPembulatan () {
    var total = 0
    this.formasiResultList.forEach(formasiResult => {
      total = total + formasiResult.pembulatan
    })

    return total
  }

  calculate () {
    this.unsurList.length = 0
    for (const key in this.unsurVolumeData) {
      this.unsurList.push({
        id: key,
        volume: this.unsurVolumeData[key].volume
      })
    }

    this.formasiService
      .calculate({
        unsurDtoList: this.unsurList,
        formasiId: this.formasiId,
        jabatanCode: this.jabatanCode
      })
      .subscribe({
        next: (formasiResultList: FormasiResult[]) => {
          this.formasiResultList = formasiResultList
          this.isModalOpen = true
        }
      })
  }

  submit () {
    this.formasiRequest.formasiId = this.formasiId
    this.formasiRequest.unsurDtoList = this.unsurList
    this.formasiRequest.jabatanCode = this.jabatanCode

    this.pendingFormasiService.save(this.formasiRequest).subscribe({
      next: () => this.router.navigate(['/formasi/formasi-task'])
    })
  }
}
