import { Component } from '@angular/core'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import { Instansi } from '../../../modules/maintenance/models/instansi.model'
import { MapComponent } from '../../../modules/map-leaflet/components/map/map.component'
import { Input } from '@angular/core'
@Component({
  selector: 'app-unit-kerja-detail',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './unit-kerja-detail.component.html',
  styleUrl: './unit-kerja-detail.component.scss'
})
export class UnitKerjaDetailComponent {
  @Input() unitKerjaIdFromParent: string = ''
  id: string = ''
  unitKerja: UnitKerja = new UnitKerja()
  instasi: Instansi = new Instansi()
  isUnitKerjaLoading$ = new BehaviorSubject<boolean>(false)
  isInstansiLoading$ = new BehaviorSubject<boolean>(false)
  wilayahName: string = ''

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit () {
    console.log('1', this.unitKerjaIdFromParent)
    if (this.unitKerjaIdFromParent === '') {
      this.id = this.activatedRoute.snapshot.paramMap.get('id') || ''
      this.getDetailUnitKerja()
    } else {
      console.log('3', this.unitKerjaIdFromParent)
      this.id = this.unitKerjaIdFromParent
      this.getDetailUnitKerja()
    }
  }

  getDetailUnitKerja () {
    this.apiService.getData(`/api/v1/unit_kerja/${this.id}`).subscribe({
      next: (response: any) => {
        this.isUnitKerjaLoading$.next(true)
        this.unitKerja = new UnitKerja(response)
        console.log(this.unitKerja)
        this.getInstasiDetail()
        this.getWilayahName(this.unitKerja.wilayahCode)
      },
      error: err => {
        this.handlerService.handleAlert(
          'Error',
          'Gagal mengambil data unit kerja'
        )
      },
      complete: () => {
        this.isUnitKerjaLoading$.next(false)
      }
    })
  }

  getInstasiDetail () {
    this.apiService
      .getData(`/api/v1/instansi/${this.unitKerja.instansiId}`)
      .subscribe({
        next: (response: any) => {
          this.isInstansiLoading$.next(true)
          this.instasi = new Instansi(response)
        },
        error: err => {
          this.handlerService.handleAlert(
            'Error',
            'Gagal mengambil data instansi'
          )
        },
        complete: () => {
          this.isInstansiLoading$.next(false)
        }
      })
  }

  getWilayahName (wilayahCode: string) {
    this.apiService.getData(`/api/v1/wilayah`).subscribe({
      next: (response: any) => {
        this.wilayahName = response.find(
          (item: any) => item.code === wilayahCode
        ).name
      }
    })
  }
}
