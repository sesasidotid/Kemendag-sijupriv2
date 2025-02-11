import { Component } from '@angular/core'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { JF } from '../../../modules/siap/models/jf.model'
import { AKPTask } from '../../../modules/akp/models/akp-task.model'
import { AkpTaskService } from '../../../modules/akp/services/akp-task.service'
import { CommonModule } from '@angular/common'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { AlertService } from '../../../modules/base/services/alert.service'
import { Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { AKPGradingPersonalComponent } from '../../../modules/base/components/akp-grading-personal/akp-grading-personal.component'
import { ConverterService } from '../../../modules/base/services/converter.service'
import { AKPTaskDetail } from '../../../modules/akp/models/akp-task-detail.modal'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
@Component({
  selector: 'app-akp-task',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, AKPGradingPersonalComponent],
  templateUrl: './akp-task.component.html',
  styleUrl: './akp-task.component.scss'
})
export class AkpTaskComponent {
  jf: JF = new JF()
  AKPTask: AKPTaskDetail = new AKPTaskDetail()
  groupedPendingTaskHistory: { [key: string]: any[] } = {}

  wannaRequest: boolean = false
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  akpDataLoading$ = new BehaviorSubject<boolean>(true)
  akpStep$ = new BehaviorSubject<number>(1)
  currentAKPStep$ = new BehaviorSubject<number>(1) //static
  isPersonalReview$ = new BehaviorSubject<boolean>(false)

  constructor (
    private apiService: ApiService,
    private akpTaskService: AkpTaskService,
    private handlerService: HandlerService,
    private alertService: AlertService,
    private router: Router,
    private converterService: ConverterService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit () {
    this.getJF()
    this.getAKPTask()
    this.fetchPhotoProfile()
  }

  fetchPhotoProfile () {
    this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
      next: blob => {
        if (blob.size === 0) {
          this.profileImageSrc = 'assets/no-profile.jpg'
          return
        }
        const objectUrl = URL.createObjectURL(blob)
        this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      },
      error: err => {
        console.error('Error fetching profile image', err)
        this.profileImageSrc = 'assets/no-profile.jpg'
      }
    })
  }

  getJF () {
    this.apiService
      .getData(`/api/v1/jf/${LoginContext.getUserId()}`)
      .subscribe({
        next: response => (this.jf = new JF(response)),
        error: error => {
          this.handlerService.handleException(error)
        }
      })
  }

  getAKPTask () {
    this.akpDataLoading$.next(true)
    this.akpTaskService.findByNip(LoginContext.getUserId()).subscribe({
      next: response => {
        this.AKPTask = response
        console.log('AKPTask', this.AKPTask)

        switch (this.AKPTask.flowId) {
          case 'akp_flow_1':
            this.akpStep$.next(1)
            this.currentAKPStep$.next(1)
            break
          case 'akp_flow_2':
            this.akpStep$.next(2)
            this.currentAKPStep$.next(2)
            break
          case 'akp_flow_3':
            this.akpStep$.next(3)
            this.currentAKPStep$.next(3)
            break
          case 'akp_flow_4':
            this.akpStep$.next(4)
            this.currentAKPStep$.next(4)
            break
          default:
            break
        }

        if (this.AKPTask.pendingTaskHistory.length > 0) {
          this.groupedPendingTaskHistory = this.groupAndSortTasksByFlowId(
            this.AKPTask.pendingTaskHistory
          )
        }
        console.log(this.groupedPendingTaskHistory)
        this.akpDataLoading$.next(false)
      },
      error: error => {
        this.akpDataLoading$.next(false)
      }
    })
  }

  saveAKPTask () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) {
          return
        }

        this.akpTaskService.saveTask(LoginContext.getUserId()).subscribe({
          next: () => {
            this.alertService.showToast('Success', 'Berhasil mengajukan AKP')
            setTimeout(() => {
              this.router.navigate(['/akp/akp-task']).then(() => {
                window.location.reload()
              })
            }, 1000)
          },
          error: error => {
            this.alertService.showToast('Error', 'Gagal mengajukan AKP')
          }
        })
      }
    })
  }

  reqChange () {
    this.wannaRequest = !this.wannaRequest
  }

  handleStepClick (clickedStep: number) {
    this.currentAKPStep$.subscribe(step => {
      if (clickedStep <= step) {
        this.akpStep$.next(clickedStep)
      }
    })
  }

  groupAndSortTasksByFlowId (tasks: any[]): { [key: string]: any[] } {
    const grouped = tasks.reduce((acc, task) => {
      // Initialize array for each flowId if it doesn't exist
      if (!acc[task.flowId]) {
        acc[task.flowId] = []
      }
      // Push each task into its respective flowId group
      acc[task.flowId].push(task)
      return acc
    }, {} as { [key: string]: any[] })

    // Sort each group by lastUpdated in descending order
    Object.keys(grouped).forEach(flowId => {
      grouped[flowId].sort((a: any, b: any) => {
        const dateA = new Date(a.lastUpdated).getTime()
        const dateB = new Date(b.lastUpdated).getTime()
        return dateA - dateB // Sort in descending order
      })
    })

    return grouped
  }

  convertDate (date: string) {
    return this.converterService.dateToHumanReadable(date)
  }

  togglePersonalReview () {
    this.isPersonalReview$.next(!this.isPersonalReview$.value)
    console.log(this.isPersonalReview$.value)
  }

  ngOnDestroy () {
    this.akpDataLoading$.unsubscribe()
    this.akpStep$.unsubscribe()
    this.currentAKPStep$.unsubscribe()
  }
}
