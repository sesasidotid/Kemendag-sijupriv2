import { CommonModule } from '@angular/common'
import { LoginContext } from './../../modules/base/commons/login-context'
import { Component } from '@angular/core'
import { RoomUkom } from '../../modules/ukom/models/cat/roomukom'
import { ApiService } from '../../modules/base/services/api.service'
import { Router } from '@angular/router'
import { HandlerService } from '../../modules/base/services/handler.service'
import { interval } from 'rxjs'
import { ConfirmationService } from '../../modules/base/services/confirmation.service'
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  roomUkom: RoomUkom = new RoomUkom()
  now: number = Date.now()
  currentDate = new Date()

  //   canStart: boolean = false

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

  ngOnInit () {}

  updateCurrentTime () {
    interval(1000).subscribe(() => {
      this.now = Date.now()
    })
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
          console.log(response)

          this.roomUkom = new RoomUkom(response.roomUkomDto)
          console.log(this.roomUkom)
        },
        error: err => {
          console.error('Error fetching RoomUkom:', err)
        }
      })
  }

  //   checkCAT () {
  //     this.api
  //       .getData(`/api/v1/exam/page/CAT/${this.roomUkom.id}?page=1&limit=1`)
  //       .subscribe({
  //         next: (response: any) => {
  //           this.canStart = true
  //         },
  //         error: err => {
  //           this.canStart = false
  //         }
  //       })
  //   }
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
}
