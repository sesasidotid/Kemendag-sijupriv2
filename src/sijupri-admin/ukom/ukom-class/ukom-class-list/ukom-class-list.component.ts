import { ConfirmationService } from './../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { TabService } from '../../../../modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { BehaviorSubject } from 'rxjs'
import { UkomClassAddComponent } from '../ukom-class-add/ukom-class-add.component'
import { UkomExamScheduleAddComponent } from '../../ukom-exam-schedule/ukom-exam-schedule-add/ukom-exam-schedule-add.component'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-ukom-class-list',
  standalone: true,
  imports: [
    PagableComponent,
    CommonModule,
    UkomClassAddComponent,
    UkomExamScheduleAddComponent
  ],
  templateUrl: './ukom-class-list.component.html',
  styleUrl: './ukom-class-list.component.scss'
})
export class UkomClassListComponent {
  tab$ = new BehaviorSubject<number | null>(0)
  jabatanList$: Observable<Jabatan[]>
  jenjangList$: Observable<Jenjang[]>

  jenjangMap: Record<string, string> = {}
  jabatanMap: Record<string, string> = {}

  //   pagable$: Observable<Pagable>
  pagable$ = new BehaviorSubject<Pagable | null>(null)
  data: any[] = []
  refreshToggle: boolean = false

  constructor (
    private tabService: TabService,
    private router: Router,
    private handlerService: HandlerService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService
  ) {
    this.pagable$.next(
      new PagableBuilder('/api/v1/room_ukom/search')

        .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Kuota Peserta', 'participantQuota').build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder('Mulai', 'examStartAt').build()
        )
        .addPrimaryColumn(new PrimaryColumnBuilder('Jam', 'examEndAt').build())
        .addPrimaryColumn(
          new PrimaryColumnBuilder()
            .withDynamicValue(
              'Jabatan',
              (data: any) => this.jabatanMap[data.jabatanCode]
            )
            .build()
        )
        .addPrimaryColumn(
          new PrimaryColumnBuilder()
            .withDynamicValue(
              'Jenjang',
              (data: any) => this.jenjangMap[data.jenjangCode] || ''
            )
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction((ukom: any) => {
              this.router.navigate([`ukom/ukom-room-list/${ukom.id}`])
            }, 'info')
            .withIcon('detail')
            .build()
        )
        .addActionColumn(
          new ActionColumnBuilder()
            .setAction(
              (ukom: any) =>
                this.confirmationService.open(false).subscribe({
                  next: (result: any) => {
                    if (result) {
                      if (!result.confirmed) return

                      this.apiService
                        .deleteData(`/api/v1/room_ukom/${ukom.id}`)
                        .subscribe({
                          next: (response: any) => {
                            this.handlerService.handleAlert(
                              'Success',
                              'Data berhasil dihapus'
                            )

                            this.refreshPagableData()
                          },
                          error: (err: any) => {
                            this.handlerService.handleAlert('Error', err.error)
                          }
                        })
                    }
                  }
                }),
              'danger'
            )
            .withIcon('danger')
            .build()
        )
        .build()
    )
  }
  refreshPagableData () {
    const currentPagable = this.pagable$.value

    const updatedPagable = {
      ...currentPagable,
      limit: 10
    }
    this.pagable$.next(updatedPagable)
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.getJenjang()
    this.getJabatan()

    this.tabService
      .addTab({
        label: 'Daftar Kelas',
        isActive: true,
        icon: 'mdi-list-box',
        onClick: () => this.handleTabChange(0)
      })
      .addTab({
        label: 'Tambah Kelas',
        icon: 'mdi-plus-circle',
        onClick: () => this.handleTabChange(1)
      })
    // this.tabService.addTab({
    //   label: 'Tambah Jadwal Ukom',
    //   icon: 'mdi-list-box',
    //   onClick: () => this.handleTabChange(2)
    // })
  }

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

  handleRefreshToggle () {
    this.refreshToggle = !this.refreshToggle
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)

    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }
}
