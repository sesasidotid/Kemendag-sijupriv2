import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service'
import { AKPDetail } from '../../../modules/akp/models/akp-detail.model'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { MatrixOneTableComponent } from '../../../modules/base/components/matrix-one-table/matrix-one-table.component'
import { MatrixTwoTableComponent } from '../../../modules/base/components/matrix-two-table/matrix-two-table.component'
import { MatrixThreeTableComponent } from '../../../modules/base/components/matrix-three-table/matrix-three-table.component'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { RekapTableComponent } from '../../../modules/base/components/rekap-table/rekap-table.component'

@Component({
  selector: 'app-akp-detail',
  standalone: true,
  imports: [
    CommonModule,
    FileHandlerComponent,
    MatrixOneTableComponent,
    MatrixTwoTableComponent,
    MatrixThreeTableComponent,
    RekapTableComponent
  ],
  templateUrl: './akp-detail.component.html',
  styleUrl: './akp-detail.component.scss'
})
export class AkpDetailComponent {
  akpId: string
  inputs: FIleHandler

  AKPDetail = new AKPDetail()
  currentTab$ = new BehaviorSubject<number>(1)

  AKPDetailLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private akpTaskService: AkpTaskService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.akpId = params.get('id')
    })
    this.getAKPDetail()
  }

  getAKPDetail () {
    this.AKPDetailLoading$.next(true)
    this.akpTaskService.getAKPDetailById(this.akpId).subscribe({
      next: response => {
        this.AKPDetail = response

        this.inputs = {
          files: {
            rekomendasi: {
              label: 'File Rekomendasi AKP',
              fileName: this.AKPDetail.rekomendasi,
              source: this.AKPDetail.rekomendasiUrl
            }
          },
          listen: (key: string, source: string, base64Data: string) => {},
          viewOnly: true
        }

        this.AKPDetailLoading$.next(false)
      },
      error: error => {
        this.AKPDetailLoading$.next(false)
        console.error('Error fetching data', error)
      }
    })
  }

  backToList () {
    this.router.navigate(['/akp/akp-list/' + this.AKPDetail.nip])
  }

  tabChange (tab: number) {
    this.currentTab$.next(tab)
  }
}
