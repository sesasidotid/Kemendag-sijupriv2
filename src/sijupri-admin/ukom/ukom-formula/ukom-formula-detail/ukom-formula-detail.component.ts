import { Component } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ApiService } from '../../../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { Observable, BehaviorSubject } from 'rxjs'
import { FormulaDetail } from '../../../../modules/ukom/models/formula-detail'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-ukom-formula-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ukom-formula-detail.component.html',
  styleUrl: './ukom-formula-detail.component.scss'
})
export class UkomFormulaDetailComponent {
  id: string = ''

  FormulaDetail: FormulaDetail = new FormulaDetail()
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>

  jenjangMap: Record<string, string> = {}
  jabatanMap: Record<string, string> = {}
  FormulaDetailLoading$ = new BehaviorSubject<boolean>(false)

  filteredJabatan$: Observable<Jabatan | undefined>
  filteredJenjang$: Observable<Jenjang | undefined>

  constructor (
    private route: ActivatedRoute,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.id = this.route.snapshot.paramMap.get('id') || ''

    this.getJenjang()
    this.getJabatan()
    this.getDetailFormula()
  }

  ngOnInit () {}

  getJenjang () {
    this.apiService.getData(`/api/v1/jenjang`).subscribe({
      next: (response: any) => {
        const jenjangs = response.map(
          (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
        )

        jenjangs.forEach((jenjang: any) => {
          this.jenjangMap[jenjang.code] = jenjang.name
        })

        this.jenjangList$ = new BehaviorSubject(jenjangs).asObservable()
      },
      error: err => {
        console.error('Error fetching jenjang data:', err)
      }
    })
  }

  getJabatan () {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: (response: any) => {
        const jabatans = response.map(
          (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
        )

        jabatans.forEach((jabatan: any) => {
          this.jabatanMap[jabatan.code] = jabatan.name
        })

        this.jabatanList$ = new BehaviorSubject(jabatans).asObservable()
      },
      error: err => {
        console.error('Error fetching jabatan data:', err)
      }
    })
  }

  getDetailFormula () {
    this.FormulaDetailLoading$.next(true)
    this.apiService.getData(`/api/v1/ukom_formula/${this.id}`).subscribe({
      next: (response: FormulaDetail) => {
        this.FormulaDetail = new FormulaDetail(response)

        this.filteredJabatan$ = this.jabatanList$.pipe(
          map(jabatanList =>
            jabatanList.find(j => j.code === this.FormulaDetail.jabatanCode)
          )
        )

        this.filteredJenjang$ = this.jenjangList$.pipe(
          map(jenjangList =>
            jenjangList.find(j => j.code === this.FormulaDetail.jenjangCode)
          )
        )
      },
      error: err => {
        console.error('Error fetching formula detail:', err)
        this.handlerService.handleAlert('Error', 'Gagal mengambil data formula')
      },
      complete: () => this.FormulaDetailLoading$.next(false)
    })
  }
}
