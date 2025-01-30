import { ConfirmationService } from './../../services/confirmation.service'
import { Component } from '@angular/core'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { ActivatedRoute, Router } from '@angular/router'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../services/api.service'
import { HandlerService } from '../../services/handler.service'
import { timeInterval } from 'rxjs'

@Component({
  selector: 'app-reject-ukom-schedule',
  standalone: true,
  imports: [ConfirmationDialogComponent, CommonModule],
  templateUrl: './reject-ukom-schedule.component.html',
  styleUrl: './reject-ukom-schedule.component.scss'
})
export class RejectUkomScheduleComponent {
  key: string | null = ''

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.route.queryParams.subscribe(params => {
      this.key = params['key'] || 'Tidak ada key'
    })
  }

  reject (key: string) {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        this.apiService.getData(`/api/v1/ukom_ban/banme?key=${key}`).subscribe({
          next: response => {
            this.handlerService.handleAlert('Success', 'Data berhasil disimpan')
            setTimeout(() => {
              this.router.navigate(['/'])
            }, 3000)
          },
          error: error => this.handlerService.handleException(error)
        })
      },
      error: error => {
        console.log('error', error)
        this.handlerService.handleAlert('Error', error.error.message)
      }
    })
  }

  cancel () {
    this.router.navigate(['/'])
  }
}
