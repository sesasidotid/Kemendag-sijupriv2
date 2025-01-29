import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../modules/base/services/api.service'
import { Component } from '@angular/core'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../modules/maintenance/models/pangkat.model'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { BehaviorSubject } from 'rxjs'
import { CommonModule } from '@angular/common'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { CATSchore } from '../../../modules/ukom/models/cat/cat-schore'
@Component({
  selector: 'app-ukom-task-detail',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './ukom-task-detail.component.html',
  styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
  id: string

  jenjang: Jenjang = new Jenjang()
  pangkat: Pangkat = new Pangkat()
  CATSchore: CATSchore = new CATSchore()

  ukomDetail = new UkomTaskDetail()
  ukomDetailLoading$ = new BehaviorSubject<boolean>(false)
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  constructor (
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.id = params.get('id')
    })
    this.getParticipantUkomDetail()
  }
  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  getCATScore () {
    const exam_type_code = 'CAT'

    this.apiService
      .getData(`/api/v1/exam_grade/${exam_type_code}/${this.id}`)
      .subscribe({
        next: (response: any) => {
          this.CATSchore = new CATSchore(response)
        }
      })
  }

  getCorrectAnswer (question: any): string {
    const correctChoice = question.multipleChoiceDtoList.find(
      (choice: any) => choice.correct
    )
    return correctChoice ? correctChoice.choiceId : ''
  }

  getParticipantUkomDetail () {
    this.ukomDetailLoading$.next(true)
    this.apiService.getData(`/api/v1/participant_ukom/${this.id}`).subscribe({
      next: response => {
        this.ukomDetail = response

        console.log(this.ukomDetail)
        this.getCATScore()

        this.ukomDetailLoading$.next(false)
      },
      error: error => {
        this.ukomDetailLoading$.next(false)
        console.log(error)
      }
    })
  }
}
