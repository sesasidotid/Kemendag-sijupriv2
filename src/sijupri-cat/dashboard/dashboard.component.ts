import { CommonModule } from '@angular/common'
import { LoginContext } from './../../modules/base/commons/login-context'
import { Component } from '@angular/core'
import { RoomUkom } from '../../modules/ukom/models/cat/roomukom'
import { ApiService } from '../../modules/base/services/api.service'
import { Router } from '@angular/router'
import { HandlerService } from '../../modules/base/services/handler.service'
import { interval } from 'rxjs'
import { ConfirmationService } from '../../modules/base/services/confirmation.service'
import { CATSchore } from '../../modules/ukom/models/cat/cat-schore'
import { ModalComponent } from '../../modules/base/components/modal/modal.component'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  roomUkom: RoomUkom = new RoomUkom()
  now: number = Date.now()
  currentDate = new Date()
  CATSchore: CATSchore = new CATSchore()
  participant_id: string = ''
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  t: string = LoginContext.getApplicationCode()

  constructor (
    private api: ApiService,
    private router: Router,
    private handler: HandlerService,
    private confirmationService: ConfirmationService
  ) {
    this.getRoomUkom()
    this.updateCurrentTime()
    // this.checkCAT()
  }

  ngOnInit () {
    this.exitFullScreen()
  }

  updateCurrentTime () {
    interval(1000).subscribe(() => {
      this.now = Date.now()
    })
  }

  exitFullScreen () {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      /* Firefox */
      ;(document as any).mozCancelFullScreen()
    } else if ((document as any).webkitExitFullscreen) {
      /* Chrome, Safari, and Opera */
      ;(document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      /* IE/Edge */
      ;(document as any).msExitFullscreen()
    }
  }

  canStartExam (examStartTime: string): boolean {
    return new Date(examStartTime) <= this.currentDate
  }

  getRoomUkom () {
    this.api
      .getData(
        `/api/v1/participant_ukom/nip/${LoginContext.getUserId().replace(
          'PU-',
          ''
        )}`
      )
      .subscribe({
        next: (response: any) => {
          this.roomUkom = new RoomUkom(response.roomUkomDto)
          this.participant_id = response.id
          this.getCATScore()
        },
        error: err => {
          console.error('Error fetching RoomUkom:', err)
        }
      })
  }

  startExam (room_ukom_id: string) {
    this.api
      .postData('/api/v1/exam/start', {
        examTypeCode: 'CAT',
        roomUkomId: room_ukom_id
      })
      .subscribe({
        next: (response: any) => {
          console.log('test e', response)

          this.router.navigate(['/cat'])
        },
        error: err => {
          this.handler.handleAlert(
            'Error',
            'Gagal memulai ujian, silahkan coba lagi'
          )
          console.error('Error fetching RoomUkom:', err)
        }
      })
  }

  getCATScore () {
    const exam_type_code = 'CAT'
    const room_ukom_id = this.roomUkom.id
    this.api
      .getData(`/api/v1/exam_grade/${exam_type_code}/${this.participant_id}`)
      .subscribe({
        next: (response: any) => {
          this.CATSchore = new CATSchore(response)
        }
      })
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  getCorrectAnswer (question: any): string {
    const correctChoice = question.multipleChoiceDtoList.find(
      (choice: any) => choice.correct
    )
    return correctChoice ? correctChoice.choiceId : ''
  }
}
