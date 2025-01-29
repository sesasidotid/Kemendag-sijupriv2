import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { Component } from '@angular/core'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../modules/maintenance/models/pangkat.model'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-ukom-task-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ukom-task-detail.component.html',
  styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
  id: string

  jenjang: Jenjang = new Jenjang()
  pangkat: Pangkat = new Pangkat()

  ukomDetail = new UkomTaskDetail()
  ukomDetailLoading$ = new BehaviorSubject<boolean>(false)

  constructor (
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })
    this.ggetParticipantUkomDetail()
  }

  ggetParticipantUkomDetail () {
    this.ukomDetailLoading$.next(true)
    this.apiService.getData(`/api/v1/participant_ukom/${this.id}`).subscribe({
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
