import { Component } from '@angular/core'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { ActivatedRoute } from '@angular/router'
import { RoomUkomDetail } from '../../../../modules/ukom/models/room-ukom-detail'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'
@Component({
  selector: 'app-ukom-class-detail',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './ukom-class-detail.component.html',
  styleUrl: './ukom-class-detail.component.scss'
})
export class UkomClassDetailComponent {
  id: string
  //change when api is ready
  detailKelas: RoomUkomDetail = new RoomUkomDetail()
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  listPeserta$: Observable<any[]>

  detailKelasLoading$ = new BehaviorSubject<boolean>(false)
  filteredJabatan$: Observable<Jabatan | undefined>
  filteredJenjang$: Observable<Jenjang | undefined>

  pagable: Pagable
  data: any[] = []

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    this.getJenjang()
    this.getJabatan()

    this.pagable = new PagableBuilder(`/api/v1/exam_schedule/room/${this.id}`)
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Waktu Mulai', 'startTime').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Waktu selesai', 'endTime').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenis Ukom', 'examTypeCode').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((item: any) => {
            this.router.navigate([`/ukom/ukom-room-list/detail/${item.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .build()
  }

  ngOnInit () {
    this.getDetailKelas()
    this.getJenjang()
    this.getJabatan()
  }

  getJenjang () {
    this.jenjangList$ = this.apiService
      .getData(`/api/v1/jenjang`)
      .pipe(
        map(response =>
          response.map(
            (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
          )
        )
      )
  }

  getJabatan () {
    this.jabatanList$ = this.apiService
      .getData(`/api/v1/jabatan`)
      .pipe(
        map(response =>
          response.map(
            (jabatan: { [key: string]: any }) => new Jabatan(jabatan)
          )
        )
      )
  }

  getDetailKelas () {
    this.apiService.getData(`/api/v1/room_ukom/${this.id}`).subscribe({
      next: res => {
        this.detailKelas = res
        this.filteredJabatan$ = this.jabatanList$.pipe(
          map(jabatanList =>
            jabatanList.find(j => j.code === this.detailKelas.jabatanCode)
          )
        )

        this.filteredJenjang$ = this.jenjangList$.pipe(
          map(jenjangList =>
            jenjangList.find(j => j.code === this.detailKelas.jenjangCode)
          )
        )
      },
      error: err => {
        this.alertService.showToast('Error', err.error.message)
      }
    })
  }
}
