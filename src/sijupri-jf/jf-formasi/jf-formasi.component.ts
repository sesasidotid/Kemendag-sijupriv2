import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PagableComponent } from '../../modules/base/components/pagable/pagable.component'
import { UnitKerja } from '../../modules/maintenance/models/unit-kerja.model'
import { LoginContext } from '../../modules/base/commons/login-context'
import { AvailableFormasiInMap } from '../../modules/formasi/models/map/available-map'
import { Observable, map } from 'rxjs'
import { ApiService } from '../../modules/base/services/api.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-jf-formasi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jf-formasi.component.html',
  styleUrl: './jf-formasi.component.scss'
})
export class JfFormasiComponent {
  availableFormation: AvailableFormasiInMap[] = []
  unitKerjaDetail: UnitKerja = new UnitKerja()

  constructor (private apiService: ApiService, private router: Router) {
    this.getUnitKerjaAvailableFormation(LoginContext.getUnitKerjaId())
  }

  ngOnInit () {
    this.getUnitKerjaDetail(LoginContext.getUnitKerjaId())
  }

  hoveredJabatanIndex: number | null = null

  hoverJabatan (index: number, isHovering: boolean) {
    this.hoveredJabatanIndex = isHovering ? index : null
  }

  getUnitKerjaAvailableFormation (unit_kerja_id: string) {
    console.log('unit_kerja2_id', unit_kerja_id)

    this.apiService
      .getData(`/api/v1/formasi/calculate/unit_kerja/${unit_kerja_id}`)
      .subscribe({
        next: (res: any) => {
          this.availableFormation = res
        }
      })
  }

  getUnitKerjaDetail (unit_kerja_id: string) {
    console.log('unit_kerja_id', unit_kerja_id)
    this.apiService
      .getData(`/api/v1/unit_kerja/search?eq_id=${unit_kerja_id}`)
      .subscribe({
        next: (res: any) => {
          this.unitKerjaDetail = res.data[0]
        }
      })
  }

  getTotalRekapitulasi (): number {
    let total = 0
    this.availableFormation.forEach(item => {
      item.jenjangSumList.forEach(formasi => {
        total += Number(formasi.resultSum) || 0
      })
    })
    return total
  }
}
