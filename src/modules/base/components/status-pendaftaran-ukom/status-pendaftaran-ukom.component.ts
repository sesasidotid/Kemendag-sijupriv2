import { Component } from '@angular/core'
import { UkomTaskDetail } from '../../../ukom/models/ukom-task-detail.modal'
import { BehaviorSubject, Observable } from 'rxjs'
import { UkomTaskService } from '../../../ukom/services/ukom-task.service'
import { LoginContext } from '../../commons/login-context'
import { ModalComponent } from '../modal/modal.component'
import { UkomRevisionComponent } from '../../../../sijupri-jf/ukom/ukom-revision/ukom-revision.component'
import { CommonModule } from '@angular/common'
import { ConverterService } from '../../services/converter.service'
import { ApiService } from '../../services/api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { NonjfRevisiUkomComponent } from '../nonjf-revisi-ukom/nonjf-revisi-ukom.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
@Component({
  selector: 'app-status-pendaftaran-ukom',
  standalone: true,
  imports: [
    ModalComponent,
    UkomRevisionComponent,
    CommonModule,
    NonjfRevisiUkomComponent
  ],
  templateUrl: './status-pendaftaran-ukom.component.html',
  styleUrl: './status-pendaftaran-ukom.component.scss'
})
export class StatusPendaftaranUkomComponent {
  pendingTask: UkomTaskDetail = new UkomTaskDetail()
  groupedUkomPendingTaskHistory: { [key: string]: any[] } = {}
  ukomDataLoading$ = new BehaviorSubject<boolean>(true)

  ukomStep$ = new BehaviorSubject<number>(1)
  currentUkomStep$ = new BehaviorSubject<number>(1)
  isModalOpen$ = new BehaviorSubject<boolean>(false)
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  key: string = undefined
  constructor (
    private ukomTaskService: UkomTaskService,
    private converterService: ConverterService,
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit () {
    this.activatedRoute.queryParams.subscribe(params => {
      const key = params['key'] // Retrieves the `id` value
      console.log('ID from query params:', key)

      if (key) {
        this.key = key
        this.getPendingTask(key)
      }
    })
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

  getPendingTask (key: string) {
    this.ukomDataLoading$.next(true)
    // this.ukomTaskService.findByNip(LoginContext.getUserId()).subscribe({
    this.apiService
      .getData(`/api/v1/participant_ukom/task/non_jf?key=${key}`)
      .subscribe({
        next: (response: any) => {
          console.log('response')
          this.pendingTask = response
          console.log('Pending Task:', this.pendingTask)

          switch (this.pendingTask.flowId) {
            case 'ukom_flow_1':
              this.ukomStep$.next(1)
              this.currentUkomStep$.next(1)
              break
            case 'ukom_flow_2':
              this.ukomStep$.next(2)
              this.currentUkomStep$.next(2)
              break
            default:
              break
          }

          if (this.pendingTask.pendingTaskHistory.length > 0) {
            this.groupedUkomPendingTaskHistory = this.groupAndSortTasksByFlowId(
              this.pendingTask.pendingTaskHistory
            )
            console.log(
              'groupedUkomPendingTaskHistory',
              this.groupedUkomPendingTaskHistory
            )
          }

          this.ukomDataLoading$.next(false)
        },
        error: error => {
          this.ukomDataLoading$.next(false)
        }
      })
  }

  groupAndSortTasksByFlowId (tasks: any[]): { [key: string]: any[] } {
    const grouped = tasks.reduce((acc, task) => {
      if (!acc[task.flowId]) {
        acc[task.flowId] = []
      }
      acc[task.flowId].push(task)
      return acc
    }, {} as { [key: string]: any[] })

    Object.keys(grouped).forEach(flowId => {
      grouped[flowId].sort((a: any, b: any) => {
        const dateA = new Date(a.lastUpdated).getTime()
        const dateB = new Date(b.lastUpdated).getTime()
        return dateA - dateB
      })
    })

    return grouped
  }

  handleStepClick (clickedStep: number) {
    this.currentUkomStep$.subscribe(step => {
      if (clickedStep <= step) {
        console.log('clickedStep', clickedStep)
        this.ukomStep$.next(clickedStep)
      }
    })
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  convertDate (date: string) {
    return this.converterService.dateToHumanReadable(date)
  }
}
