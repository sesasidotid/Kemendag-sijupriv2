import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../modules/base/services/api.service'
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  totalAKPPending: number = 0
  totalUKOMPending: number = 0
  totalFormasiPending: number = 0
  totalSIAPPending: number = 0

  constructor (private apiService: ApiService) {
    this.getTotalAKPPending()
    this.getTotalUKOMPending()
    this.getTotalFormasiPending()
  }

  getTotalAKPPending () {
    this.apiService.getData('/api/v1/akp/task/search?p').subscribe({
      next: res => {
        this.totalAKPPending = res.total
      }
    })
  }

  getTotalUKOMPending () {
    this.apiService.getData('/api/v1/participant_ukom/task/search').subscribe({
      next: res => {
        this.totalUKOMPending = res.total
      }
    })
  }

  getTotalFormasiPending () {
    this.apiService.getData('/api/v1/formasi/task/search').subscribe({
      next: res => {
        this.totalFormasiPending = res.total
      }
    })
  }
}
