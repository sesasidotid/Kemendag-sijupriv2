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
  selector: 'app-ukom-exam-detail',
  standalone: true,
  imports: [PagableComponent, CommonModule],
  templateUrl: './ukom-exam-detail.component.html',
  styleUrl: './ukom-exam-detail.component.scss'
})
export class UkomExamDetailComponent {
  roomId: string
  pagable: Pagable

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.roomId = params.get('id')
    })

    this.pagable = new PagableBuilder(
      `/api/v1/participant_ukom/room/${this.roomId}`
    )
      .addPrimaryColumn(new PrimaryColumnBuilder('NIP', 'nip').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
      .addPrimaryColumn(new PrimaryColumnBuilder('Email', 'email').build())
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((item: any) => {
            this.router.navigate([`siap/user-jf/${item.nip}`])
          }, 'info')
          .withIcon('detail')
          .build()
      )
      .build()
  }
}
