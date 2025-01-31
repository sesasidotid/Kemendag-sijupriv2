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
import { UkomTaskDetailComponent } from '../../ukom-pemetaan/ukom-task-detail/ukom-task-detail.component'
@Component({
  selector: 'app-ukom-class-participant-detail',
  standalone: true,
  imports: [PagableComponent, CommonModule, UkomTaskDetailComponent],
  templateUrl: './ukom-class-participant-detail.component.html',
  styleUrl: './ukom-class-participant-detail.component.scss'
})
export class UkomClassParticipantDetailComponent {
  id: string
  pagable: Pagable

  constructor (private activatedRoute: ActivatedRoute, private router: Router) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })

    this.pagable = new PagableBuilder(`/api/v1/participant_ukom/${this.id}`)
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
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenis Kelamin', 'jenisKelaminName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jabatan Awal', 'jabatanName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenjang Awal', 'jenjangName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Pangkat', 'pangkatName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jabatan Tujuan', 'nextJabatanName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Jenjang Tujuan', 'nextJenjangName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama Instansi', 'instansiName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Nama Unit Kerja', 'unitKerjaName').build()
      )
      .build()
  }
}
