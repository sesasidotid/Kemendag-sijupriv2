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
  jabatanList: Jabatan[] = []
  jenjangList: Jenjang[] = []
  listPeserta: any[] = []

  jabatanName: string

  detailKelasLoading$ = new BehaviorSubject<boolean>(false)

  pagable: Pagable
  data: any[] = []

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    // this.pagable = new PagableBuilder(`/api/v1/room_ukom/${this.id}`)
    //   .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'NIP').build())
    //   .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'Email').build())
    //   .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'Nama').build())
    //   .build()
    this.getJenjang()
    this.getJabatan()
  }

  ngOnInit () {
    this.getDetailKelas()
  }

  getJenjang () {
    this.apiService.getData(`/api/v1/jenjang`).subscribe({
      next: res => {
        this.jenjangList = res
      },
      error: err => {
        this.alertService.showToast('Error', err.error.message)
      }
    })
  }

  getJabatan () {
    this.apiService.getData(`/api/v1/jabatan`).subscribe({
      next: res => {
        this.jabatanList = res
      },
      error: err => {
        this.alertService.showToast('Error', err.error.message)
      }
    })
  }

  getjabatanName (): string {
    const jabatan = this.jabatanList.find(
      j => j.code === this.detailKelas.jabatanCode
    )
    return jabatan ? jabatan.name : 'N/A'
  }

  getDetailKelas () {
    this.apiService.getData(`/api/v1/room_ukom/${this.id}`).subscribe({
      next: res => {
        this.detailKelas = res
        // this.listPeserta = res['peserta']
      },
      error: err => {
        this.alertService.showToast('Error', err.error.message)
      }
    })
  }
}
