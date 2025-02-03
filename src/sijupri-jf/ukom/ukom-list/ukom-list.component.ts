import { ConfirmationDialogComponent } from './../../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { LoginContext } from './../../../modules/base/commons/login-context'
import { JenisUkom } from '../../../modules/ukom/models/jenis-ukom'
import { Component } from '@angular/core'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../modules/base/commons/pagable/pagable-builder'
import { Router } from '@angular/router'
import { Pagable } from '../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../modules/base/components/pagable/pagable.component'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../modules/base/services/api.service'
import { BehaviorSubject, Observable } from 'rxjs'
import { UkomExamScheduleJF } from '../../../modules/ukom/models/ukom-exam-schedule-jf'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { map } from 'rxjs/operators'
import { RoomUkom } from '../../../modules/ukom/models/room-ukom.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
@Component({
  selector: 'app-ukom-list',
  standalone: true,
  imports: [PagableComponent, EmptyStateComponent, CommonModule],
  templateUrl: './ukom-list.component.html',
  styleUrl: './ukom-list.component.scss'
})
export class UkomListComponent {
  pagable: Pagable
  schedulePagable$: Observable<Pagable>
  id: string = LoginContext.getUserId()
  //   ukomSchedule$: Observable<UkomExamScheduleJF>
  ukomSchedule: UkomExamScheduleJF

  jadwalPagable: Pagable
  //   ukomSchedule$: UkomExamScheduleJF

  constructor (
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.pagable = new PagableBuilder(
      `/api/v1/participant_ukom/search/${this.id}`
      //   `/api/v1/participant_ukom/all/${this.id}`
    )
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
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal', 'lastUpdated').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.router.navigate([`/ukom/ukom-list/detail/${ukom.id}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .addFilter(
        new PageFilterBuilder('equal')
          .setProperty('nip')
          .withDefaultValue(LoginContext.getUserId())
          .build()
      )
      //   .addFilter(
      //     new PageFilterBuilder('equal')
      //       .setProperty('lastUpdated')
      //       .withField('Tanggal', 'date')
      //       .build()
      //   )
      .build()

    this.jadwalPagable = new PagableBuilder(
      `/api/v1/participant_ukom/nip/${this.id}`
    )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenis Ujian', 'examTypeCode').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Waktu Mulai', 'startTime').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Waktu Selesai', 'endTime').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((ukom: any) => {
            this.navigateToCATPage()
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .build()

    this.getUkomSchedule()
  }

  ngOnInit () {
    // this.getUkomSchedule()
    // this.ukomSchedule$.subscribe(jabatanList => {})
  }

  getUkomSchedule () {
    // this.ukomSchedule$ = this.apiService
    //   .getData(`/api/v1/participant_ukom/nip/${this.id}`)
    //   .pipe(
    //     map(response => {
    //       const now = new Date()
    //       const roomUkom = new UkomExamScheduleJF(response.roomUkomDto)
    //       console.log('Exam End Time (d1):', roomUkom)
    //       roomUkom.examScheduleDtoList = roomUkom.examScheduleDtoList.filter(
    //         schedule => {
    //           const scheduleEndTime = new Date(
    //             schedule.endTime.replace(' ', 'T')
    //           )
    //           console.log('Exam End Time (d2):', scheduleEndTime)
    //           return scheduleEndTime > now
    //         }
    //       )
    //       return roomUkom
    //     })
    //   )
    this.apiService
      .getData(`/api/v1/participant_ukom/nip/${this.id}`)
      .subscribe({
        next: res => {
          console.log('dto', res)
          if (res.roomUkomDto) {
            this.ukomSchedule = new UkomExamScheduleJF(res.roomUkomDto)
          } else {
            this.ukomSchedule.examScheduleDtoList = []
          }
        }
      })
  }

  navigateToCATPage () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        LoginContext.release()

        this.router.navigate(['/login-cat'])
      }
    })
  }
}
