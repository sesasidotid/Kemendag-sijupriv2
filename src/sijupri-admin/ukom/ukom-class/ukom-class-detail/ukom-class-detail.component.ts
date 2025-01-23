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
import { TabService } from '../../../../modules/base/services/tab.service'
import { UkomExamScheduleAddComponent } from '../../ukom-exam-schedule/ukom-exam-schedule-add/ukom-exam-schedule-add.component'
@Component({
  selector: 'app-ukom-class-detail',
  standalone: true,
  imports: [PagableComponent, CommonModule, UkomExamScheduleAddComponent],
  templateUrl: './ukom-class-detail.component.html',
  styleUrl: './ukom-class-detail.component.scss'
})
export class UkomClassDetailComponent {
  id: string
  detailKelas: RoomUkomDetail = new RoomUkomDetail()
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>
  listPeserta$: Observable<any[]>

  detailKelasLoading$ = new BehaviorSubject<boolean>(false)
  filteredJabatan$: Observable<Jabatan | undefined>
  filteredJenjang$: Observable<Jenjang | undefined>

  pagableJenisUkom: Pagable
  pagable: Pagable
  tab$ = new BehaviorSubject<number | null>(0)

  data: any[] = []

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public tabService: TabService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    this.getJenjang()
    this.getJabatan()

    this.pagable = new PagableBuilder(
      `/api/v1/participant_ukom/room/${this.id}`
    )
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'email').build())
      .addPrimaryColumn(
        new PrimaryColumnBuilder()
          .withDynamicValue('Jenis Ukom', (data: any) =>
            data.jenisUkom === 'KENAIKAN_JENJANG'
              ? 'Kenaikan Jenjang'
              : data.jenisUkom === 'PERPINDAHAN_JABATAN'
              ? 'Perpindahan Jabatan'
              : data.jenisUkom
          )
          .build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((data: any) => {
            this.router.navigate([
              `/ukom/ukom-room-list/detail-participant/${data.id}`
            ])
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

    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      .addTab({
        label: 'Detail Kelas',
        icon: 'mdi-list-box',
        isActive: true,
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Jadwal UKom',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)
    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
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
