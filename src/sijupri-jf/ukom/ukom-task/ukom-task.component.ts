import { UkomTaskService } from '../../../modules/ukom/services/ukom-task.service'
import { Component } from '@angular/core'
import { JF } from '../../../modules/siap/models/jf.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { UkomTaskFormComponent } from '../ukom-task-form/ukom-task-form.component'
import { Ukom } from '../../../modules/ukom/models/ukom.model'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { PesertaUkom } from '../../../modules/ukom/models/peserta-ukom.model'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { Task } from '../../../modules/workflow/models/task.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { UkomTaskDetail } from '../../../modules/ukom/models/ukom-task-detail.modal'
import { ConverterService } from '../../../modules/base/services/converter.service'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
import { RekapButtonComponent } from '../../../modules/base/components/rekap-table/rekap-button.component'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { UkomRevisionComponent } from '../ukom-revision/ukom-revision.component'
import { DomSanitizer } from '@angular/platform-browser'
import { SafeUrl } from '@angular/platform-browser'
@Component({
  selector: 'app-ukom-task',
  standalone: true,
  imports: [
    CommonModule,
    UkomTaskFormComponent,
    FileHandlerComponent,
    EmptyStateComponent,
    RekapButtonComponent,
    ModalComponent,
    UkomRevisionComponent
  ],
  templateUrl: './ukom-task.component.html',
  styleUrl: './ukom-task.component.scss'
})
export class UkomTaskComponent {
  //   pendingTask: PendingTask

  pendingTask: UkomTaskDetail = new UkomTaskDetail()
  pesertaUkom: PesertaUkom
  jf: JF = new JF()
  ukom: Ukom
  isFormOpen: boolean = false
  detectedDokumen: any = {}

  ukomDataLoading$ = new BehaviorSubject<boolean>(true)
  ukomStep$ = new BehaviorSubject<number>(1)
  currentUkomStep$ = new BehaviorSubject<number>(1)
  groupedUkomPendingTaskHistory: { [key: string]: any[] } = {}
  wannaRequest: boolean = false
  isModalOpen$ = new BehaviorSubject<boolean>(false)
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  constructor (
    private apiService: ApiService,
    private handlerService: HandlerService,
    private confirmationService: ConfirmationService,
    private ukomTaskService: UkomTaskService,
    private converterService: ConverterService,
    private sanitizer: DomSanitizer
  ) {}

  inputs: FIleHandler = {
    files: {},
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      this.detectedDokumen[key] = {
        base64: base64Data,
        label: label
      }
    }
  }

  ngOnInit () {
    this.getPendingTask()
    this.getJF()
    // this.getUkomTask()
  }

  //   getUkomTask () {
  //     this.ukomDataLoading$.next(true)

  //     this.ukomTaskService.findByNip(LoginContext.getUserId()).subscribe({
  //       next: response => {
  //         console.log('ukomDataLoading', this.ukomDataLoading$)
  //         this.pendingTask = response
  //         console.log('this.ukomTask', this.pendingTask)
  //       }
  //     })
  //   }

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

  getPendingTask () {
    this.ukomDataLoading$.next(true)
    // this.apiService
    //   .getData(`/api/v1/participant_ukom/task/nip/${LoginContext.getUserId()}`)
    //   .subscribe
    this.ukomTaskService.findByNip(LoginContext.getUserId()).subscribe({
      next: response => {
        console.log('response')
        //   this.pendingTask = new PendingTask(response)
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

        // this.detectedDokumen = {}
        // const dokumenPersyaratanListTemp: any = []
        // let count = 1
        // this.pesertaUkom.pendingTaskHistory.forEach(dokumenPersyaratan => {
        //   if (dokumenPersyaratan.status == 'REJECT') {
        //     this.inputs.files['dokumenPersyaratan_' + count] = {
        //       label: dokumenPersyaratan.dokumenName,
        //       source: dokumenPersyaratan.dokumenUrl
        //     }
        //     count = count + 1
        //   } else {
        //     dokumenPersyaratanListTemp.push(dokumenPersyaratan)
        //   }
        // })

        //   this.pesertaUkom.pendingTaskHistory = dokumenPersyaratanListTemp
      },
      error: error => {
        this.ukomDataLoading$.next(false)
        //   this.handlerService.handleException(error)
        this.getJF()
        //   this.getLatestUkom()
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

  getLatestUkom () {
    this.apiService
      .getData(`/api/v1/participant_ukom/task/nip/${LoginContext.getUserId()}`)
      .subscribe({
        next: response => (this.ukom = new Ukom(response)),
        error: error => console.log('error', error)
        // this.handlerService.handleException(Error)
      })
  }

  handleStepClick (clickedStep: number) {
    this.currentUkomStep$.subscribe(step => {
      if (clickedStep <= step) {
        this.ukomStep$.next(clickedStep)
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

  reqChange () {
    this.wannaRequest = !this.wannaRequest
  }

  convertDate (date: string) {
    return this.converterService.dateToHumanReadable(date)
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }
  submit () {
    // for (const key in this.detectedDokumen) {
    //   this.pesertaUkom.pendingTaskHistory.push({
    //     file: this.detectedDokumen[key].base64,
    //     dokumenName: this.detectedDokumen[key].label
    //   })
    // }
    // this.confirmationService.open(false).subscribe({
    //   next: result => {
    //     if (!result.confirmed) return
    //     const task = new Task()
    //     task.id = this.pendingTask.id
    //     task.taskAction = 'approve'
    //     task.object = this.pesertaUkom
    //     this.apiService
    //       .postData(`/api/v1/peserta_ukom/task/submit`, task)
    //       .subscribe({
    //         next: () => {},
    //         error: error => this.handlerService.handleException(error)
    //       })
    //   }
    // })
  }

  ngOnDestroy () {
    this.ukomDataLoading$.unsubscribe()
    this.ukomStep$.unsubscribe()
    this.currentUkomStep$.unsubscribe()
  }
}
