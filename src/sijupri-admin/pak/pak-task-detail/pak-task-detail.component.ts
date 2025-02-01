import { Component } from '@angular/core'
import { JfService } from '../../../modules/siap/services/jf.service'
import { ActivatedRoute, Router } from '@angular/router'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ObjectTask } from '../../../modules/workflow/models/object-task.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { Task } from '../../../modules/workflow/models/task.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { ConverterService } from '../../../modules/base/services/converter.service'
import { BehaviorSubject } from 'rxjs'
import { SafeUrl } from '@angular/platform-browser'
import { RWKinerja } from '../../../modules/siap/models/rw-kinerja.model'

@Component({
  selector: 'app-pak-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './pak-task-detail.component.html',
  styleUrl: './pak-task-detail.component.scss'
})
export class PakTaskDetailComponent {
  nip: string
  pendingTaskList: PendingTask[] = []
  jf: JF = new JF()

  openedAccordion: string[] = []
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  pendingTaskloading$ = new BehaviorSubject<boolean>(true)
  detailTaskloading$ = new BehaviorSubject<boolean>(true)

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private converterService: ConverterService,
    private jfService: JfService,
    private sanitizer: DomSanitizer
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.nip = params.get('id')
    })
  }

  ngOnInit() {
    this.getJF()
    this.getTaskDetail()
  }

  fetchPhotoProfile() {
    this.apiService.getPhotoProfile(LoginContext.getUserId()).subscribe({
      next: blob => {
        const objectUrl = URL.createObjectURL(blob)
        this.profileImageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl)
      },
      error: err => {
        console.error('Error fetching profile image', err)
        this.profileImageSrc = 'assets/no-profile.jpg'
      }
    })
  }
  getTaskDetail() {
    this.pendingTaskloading$.next(true)
    this.apiService.getData(`/api/v1/jf/task/kinerja/group/${this.nip}`).subscribe({
      next: (pendingTaskList: PendingTask[]) => {
        if (pendingTaskList.length == 0)
          this.router.navigate(['/pak/pak-task-list'])
        this.pendingTaskList = pendingTaskList
        this.pendingTaskloading$.next(false)
      },
      error: error => {
        console.error('Error fetching data', error)
        this.alertService.showToast(
          'Error',
          'Gagal mendapatkan data verifikasi user JF!'
        )

        this.pendingTaskloading$.next(false)
        // this.getTaskDetail();
      }
    })
  }

  toggleExpand(pendingTask: PendingTask) {
    pendingTask['isOpen'] = !(pendingTask['isOpen'] || false)

    if (
      (pendingTask['isOpen'] || false) &&
      !pendingTask.hasOwnProperty('object')
    ) {
      this.detailTaskloading$.next(true)
      if (pendingTask['isOpen']) {
        // this.openedAccordion.push(pendingTask.id);
        this.openedAccordion = [pendingTask.id]
        // console.log(this.openedAccordion);
      }
      // console.log(this.openedAccordion.includes(pendingTask.id))

      this.apiService
        .getData(`/api/v1/object_task/${pendingTask.objectTaskId}`)
        .subscribe({
          next: (objectTask: ObjectTask) => {
            pendingTask['object'] = new RWKinerja(objectTask.object)
            this.detailTaskloading$.next(false)
          },
          error: error => {
            console.error('Error fetching data', error)
            this.alertService.showToast(
              'Error',
              'Gagal mendapatkan data detail task!'
            )
            this.detailTaskloading$.next(false)
          }
        })
    }
  }

  openConfirmationDialog(
    pendingTask: PendingTask,
    taskAction: string,
    withComment: boolean = false
  ) {
    this.confirmationService.open(withComment).subscribe({
      next: result => {
        if (!result.confirmed) return

        pendingTask['taskAction'] = taskAction
        if (withComment && result.comment) {
          pendingTask.remark = result.comment
        }
        this.submit(pendingTask)
      }
    })
  }

  visibility(rwSertifikasi: any) {
    return () => rwSertifikasi.kategoriSertifikasiValue == 2
  }

  getTaskDate(date: string) {
    return this.converterService.dateToHumanReadable(date)
  }

  getJF() {
    this.jfService.findByNip(this.nip).subscribe({
      next: (jf: JF) => (this.jf = jf)
    })
  }

  submit(pendingTask: PendingTask) {
    const task = new Task()
    task.id = pendingTask.id
    task.taskAction = pendingTask.taskAction
    task.remark = pendingTask.remark ?? null
    console.log(task.taskAction)

    this.apiService
      .postData(
        `/api/v1/${pendingTask.workflowName.replace('_task', '')}/task/submit`,
        task
      )
      .subscribe({
        next: () => {
          if (task.taskAction == 'approve') {
            this.alertService.showToast('Success', 'Berhasil menyetujui!')
          } else {
            this.alertService.showToast('Success', 'Berhasil menolak!')
          }
          this.getTaskDetail()
        },
        error: error => {
          console.error('Error fetching data', error)
          if (task.taskAction == 'approve') {
            this.alertService.showToast('Error', 'Gagal menyetujui!')
          } else {
            this.alertService.showToast('Error', 'Gagal menolak!')
          }
        }
      })
  }
}
