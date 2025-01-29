import { Component, OnInit } from '@angular/core'
import { ApiService } from '../../modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { LoginContext } from '../../modules/base/commons/login-context'
import { RoomUkom } from '../../modules/ukom/models/cat/roomukom'
import { CATQuestions } from '../../modules/ukom/models/cat/cat-questions'
import { PesertaUkom } from '../../modules/ukom/models/peserta-ukom.model'
import { HandlerService } from '../../modules/base/services/handler.service'
import { ConfirmationService } from '../../modules/base/services/confirmation.service'
import { ConfirmationDialogComponent } from '../../modules/base/components/confirmation-dialog/confirmation-dialog.component'
import { Router } from '@angular/router'
@Component({
  selector: 'app-cat-page',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './cat-page.component.html',
  styleUrl: './cat-page.component.scss'
})
export class CatPageComponent {
  data: CATQuestions = new CATQuestions()
  cat: string = 'CAT'
  room_id: string = ''
  roomUkom: RoomUkom = new RoomUkom()
  pesertaUkom: PesertaUkom = new PesertaUkom()

  currentPage: number = 1
  totalQuestions: number = 0
  selectedAnswer: { [questionId: string]: string } = {}
  savedAnswer: { [questionId: string]: string } = {}

  constructor (
    private api: ApiService,
    private handler: HandlerService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.getRoomUkom()
  }

  ngOnInit () {
    // this.getQuestion()
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
          console.log('focus', response.roomUkomDto.id)

          this.roomUkom = new RoomUkom(response.roomUkomDto)
          this.room_id = response.roomUkomDto.id
          this.pesertaUkom = response
          //   console.log('peserta', this.pesertaUkom)

          this.getQuestion()
        },
        error: err => {
          console.error('Error fetching RoomUkom:', err)
        }
      })
  }

  getQuestion () {
    this.api
      .getData(
        `/api/v1/exam/page/CAT/${this.room_id}?page=${this.currentPage}&limit=1`
      )
      .subscribe({
        next: (response: any) => {
          this.data = response
          this.totalQuestions = response.total

          this.data.data.forEach((question: any) => {
            if (question.answerDto?.id) {
              console.log('Saved answer:', question.answerDto.answerChoice)
              this.savedAnswer[question.id] = question.answerDto.answerChoice
              this.selectedAnswer[question.id] = question.answerDto.answerChoice
            }

            console.log(this.savedAnswer)
          })
        },
        error: err => {
          console.error('Error fetching questions:', err)
        }
      })
  }

  navigateToPage (page: number) {
    if (page > 0 && page <= this.data.lastPage) {
      this.currentPage = page
      this.getQuestion()
    }
  }

  selectAnswer (questionId: string, choiceId: string) {
    this.selectedAnswer[questionId] = choiceId
    console.log('Selected answer:', this.selectedAnswer)
  }

  saveAnswer (questionId: string) {
    const selectedChoiceId = this.selectedAnswer[questionId]
    if (!selectedChoiceId) {
      console.warn('No answer selected for question:', questionId)
    }

    const payload = {
      answer_choice: selectedChoiceId,
      participant_id: this.pesertaUkom.id,
      question_id: questionId
    }

    this.navigateToPage(this.currentPage + 1)

    console.log('Payload:', payload)

    this.api.postData('/api/v1/exam/answer', payload).subscribe({
      next: response => {
        console.log('Answer saved successfully:', response)
        this.savedAnswer[questionId] = selectedChoiceId
      },
      error: err => {
        console.error('Error saving answer:', err)
        this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
      }
    })
  }

  submitAnswer () {
    this.confirmationService.open(false).subscribe({
      next: (response: any) => {
        if (response.confirmed) {
          const payload = {
            examTypeCode: 'CAT',
            roomUkomId: this.room_id
          }

          this.api.postData('/api/v1/exam/finish', payload).subscribe({
            next: response => {
              console.log('Answer submitted successfully:', response)
              this.handler.handleAlert('Success', 'Jawaban berhasil disimpan')
              this.router.navigate(['/'])
            },
            error: err => {
              console.error('Error submitting answer:', err)
              this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
            }
          })
        }
      }
    })
  }
}
