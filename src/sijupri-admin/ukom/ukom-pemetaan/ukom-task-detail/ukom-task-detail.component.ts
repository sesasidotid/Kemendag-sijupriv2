import { Component } from '@angular/core'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { ApiService } from '../../../../modules/base/services/api.service'
import { UkomTaskDetail } from '../../../../modules/ukom/models/ukom-task-detail.modal'
@Component({
  selector: 'app-ukom-task-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ukom-task-detail.component.html',
  styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
  participant_ukom_id: string
  jabatan: Jabatan = new Jabatan()
  jenjang: Jenjang = new Jenjang()
  pangkat: Pangkat = new Pangkat()

  ukomDetail = new UkomTaskDetail()
  ukomDetailLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.participant_ukom_id = params.get('id')
    })

    this.getParticipantUkomDetail()
  }

  getParticipantUkomDetail () {
    this.ukomDetailLoading$.next(true)
    this.apiService
      .getData(`/api/v1/participant_ukom/${this.participant_ukom_id}`)
      .subscribe({
        next: response => {
          this.ukomDetail = response

          console.log(this.ukomDetail)
          this.ukomDetailLoading$.next(false)
        },
        error: error => {
          this.ukomDetailLoading$.next(false)
          console.log(error)
        }
      })
  }
}
