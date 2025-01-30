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
import { BehaviorSubject } from 'rxjs'
import { ReactiveFormsModule } from '@angular/forms'
import { HostListener } from '@angular/core'

@Component({
  selector: 'app-cat-page',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent, ReactiveFormsModule],
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

  examEndTime: Date | null = null
  remainingTime: string = ''
  remainingSeconds: number = 0 // Tambahkan variabel baru
  isSubmitted$ = new BehaviorSubject<boolean>(false)
  //   isSubmitted$ = false
  showWarning: boolean = false
  warningCountdown: number = 30
  private warningInterval: any

  private countdownInterval: any

  constructor (
    private api: ApiService,
    private handler: HandlerService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.getRoomUkom()
    this.enterFullScreen()
  }

  ngOnInit () {
    // this.getQuestion()
    this.enterFullScreen()
    // window.addEventListener('blur', this.onBlur.bind(this))
    this.isSubmitted$.subscribe(submitted => {
      if (submitted) {
        this.showWarning = false
      }
    })
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove (event: MouseEvent) {
    if (this.isSubmitted$.value) return

    const isInsideExamArea = this.isMouseInsideExamArea(event)
    if (!isInsideExamArea) {
      this.showWarning = true
      this.startWarningCountdown()
    } else {
      this.showWarning = false
      this.resetWarningCountdown()
    }
  }

  @HostListener('document:visibilitychange', [])
  handleVisibilityChange () {
    if (document.hidden) {
      // You can also submit the exam automatically or log this action
    }
  }

  isMouseInsideExamArea (event: MouseEvent): boolean {
    const examArea = document.querySelector('.parent') as HTMLElement
    if (!examArea) return false

    const rect = examArea.getBoundingClientRect()
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    )
  }

  startWarningCountdown () {
    if (this.warningInterval) {
      clearInterval(this.warningInterval)
    }
    this.warningCountdown = 30
    this.warningInterval = setInterval(() => {
      this.warningCountdown--
      if (this.warningCountdown <= 0) {
        clearInterval(this.warningInterval)
        this.submitAnswer(false)
      }
    }, 1000)
  }

  resetWarningCountdown () {
    if (this.warningInterval) {
      clearInterval(this.warningInterval)
    }
    this.warningCountdown = 30
  }

  onBlur () {
    alert(
      'Please do not switch tabs or open other applications during the exam.'
    )
    this.enterFullScreen()
  }

  enterFullScreen () {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if ((elem as any).mozRequestFullScreen) {
      /* Firefox */
      ;(elem as any).mozRequestFullScreen()
    } else if ((elem as any).webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      ;(elem as any).webkitRequestFullscreen()
    } else if ((elem as any).msRequestFullscreen) {
      /* IE/Edge */
      ;(elem as any).msRequestFullscreen()
    }
  }

  ngOnDestroy () {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  }
  backToHome () {
    this.router.navigate(['/'])
  }
  startCountdown () {
    if (!this.examEndTime) return

    this.countdownInterval = setInterval(() => {
      console.log('w', this.remainingTime)
      const now = new Date().getTime()
      const endTime = this.examEndTime!.getTime()
      const timeLeft = endTime - now

      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval)
        this.remainingTime = '00:00:00'
        this.remainingSeconds = 0 // Pastikan bernilai 0
        this.submitAnswer(false)
      } else {
        this.remainingTime = this.formatTime(timeLeft)
        this.remainingSeconds = Math.floor(timeLeft / 1000) // Simpan dalam detik
      }
    }, 1000)
  }

  formatTime (ms: number): string {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(
      seconds
    )}`
  }

  padZero (num: number): string {
    return num < 10 ? `0${num}` : `${num}`
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

          if (response.roomUkomDto.examScheduleDtoList) {
            this.examEndTime = new Date(
              response.roomUkomDto.examScheduleDtoList.find(
                (e: any) => e.examTypeCode === 'CAT'
              )?.endTime
            )
            this.startCountdown()
          }

          this.getQuestion()
        },
        error: err => {
          console.error('Error fetching RoomUkom:', err)
        }
      })
  }

  getQuestion () {
    this.api
      .getData(`/api/v1/exam/page/CAT/${this.room_id}?limit=1000&page=1`)
      .subscribe({
        next: (response: any) => {
          this.data.data = response.data
          this.totalQuestions = this.data.data.length

          // Jika ada jawaban tersimpan, load jawaban
          this.data.data.forEach((question: any) => {
            if (question.answerDto?.id) {
              this.savedAnswer[question.id] = question.answerDto.answerChoice
              this.selectedAnswer[question.id] = question.answerDto.answerChoice
            }
          })
        },
        error: err => {
          console.error('Error fetching questions:', err)
          if (err.error.message === `Exam's already ended`) {
            this.isSubmitted$.next(true)
            // this.isSubmitted$ = true
          } else {
            this.handler.handleAlert('Error', 'Gagal mengambil pertanyaan')
          }
        }
      })
  }

  navigateToPage (page: number) {
    if (page > 0 && page <= this.totalQuestions) {
      this.currentPage = page
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
      return
    }

    const payload = {
      answer_choice: selectedChoiceId,
      participant_id: this.pesertaUkom.id,
      question_id: questionId
    }

    console.log('Payload:', payload)

    this.api.postData('/api/v1/exam/answer', payload).subscribe({
      next: response => {
        console.log('Answer saved successfully:', response)
        this.savedAnswer[questionId] = selectedChoiceId

        // Pindah ke pertanyaan berikutnya jika masih ada
        if (this.currentPage < this.totalQuestions) {
          this.navigateToPage(this.currentPage + 1)
        }
      },
      error: err => {
        console.error('Error saving answer:', err)
        this.handler.handleAlert('Error', 'Gagal menyimpan jawaban')
      }
    })
  }

  submitAnswer (open_dialog: boolean = true) {
    const payload = {
      examTypeCode: 'CAT',
      roomUkomId: this.room_id
    }

    if (open_dialog) {
      this.confirmationService.open(false).subscribe({
        next: (response: any) => {
          if (response.confirmed) {
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

    if (!open_dialog) {
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
}
