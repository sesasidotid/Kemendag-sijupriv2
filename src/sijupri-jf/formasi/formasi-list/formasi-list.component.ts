import { Component } from '@angular/core'
<<<<<<< HEAD
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
=======
import { CommonModule } from '@angular/common'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { AvailableFormasiInMap } from '../../../modules/formasi/models/map/available-map'
import { Observable, map } from 'rxjs'
import { ApiService } from '../../../modules/base/services/api.service'
>>>>>>> feisal_dev

@Component({
  selector: 'app-formasi-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formasi-list.component.html',
  styleUrl: './formasi-list.component.scss'
})
export class FormasiListComponent {
<<<<<<< HEAD
  columns: any = [
    { property: 'nip', header: 'NIP' },
    { property: 'user|name', header: 'Nama' },
    { property: 'user|email', header: 'Email' },
    { url: { detail: '/' }, header: 'Action' }
  ]
  filters: any = [
    { lable: 'NIP', type: 'text', key: 'like_nip' },
    { lable: 'Nama', type: 'text', key: 'like_user|name' },
    { lable: 'Email', type: 'text', key: 'like_user|email' }
  ]
=======
  unitKerjaId: string = ''
  availableFormation: AvailableFormasiInMap[] = []
  unitKerjaDetail: UnitKerja = new UnitKerja()

  constructor (private apiService: ApiService) {
    this.getUnitKerjaAvailableFormation(LoginContext.getUnitKerjaId())
  }

  ngOnInit () {
    this.getUnitKerjaDetail(LoginContext.getUnitKerjaId())
  }

  getUnitKerjaAvailableFormation (unit_kerja_id: string) {
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
  //   getTotalRekapitulasi (): number {
  //     let total = 0
  //     this.availableFormation.forEach(item => {
  //       item.jenjangSumList.forEach(formasi => {
  //         total += Number(formasi.resultSum) || 0
  //       })
  //     })
  //     return total
  //   }
>>>>>>> feisal_dev
}
