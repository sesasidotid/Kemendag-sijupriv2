import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { JfService } from '../../../modules/siap/services/jf.service'
import { ActivatedRoute, Router } from '@angular/router'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ObjectTaskService } from '../../../modules/workflow/services/object-task.service'
import { ObjectTask } from '../../../modules/workflow/models/object-task.model'
import { JF } from '../../../modules/siap/models/jf.model'
import { RWPendidikan } from '../../../modules/siap/models/rw-perndidikan.model'
import { RWPangkat } from '../../../modules/siap/models/rw-pangkat.model'
import { RWJabatan } from '../../../modules/siap/models/rw-jabatan.model'
import { RWKompetensi } from '../../../modules/siap/models/rw-kompetensi.model'
import { RWSertifikasi } from '../../../modules/siap/models/rw-sertifikasi.model'
import { Task } from '../../../modules/workflow/models/task.model'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { ConverterService } from '../../../modules/base/services/converter.service'
import { BehaviorSubject } from 'rxjs'
import { SafeUrl } from '@angular/platform-browser'
@Component({
  selector: 'app-jf-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, FileHandlerComponent],
  templateUrl: './jf-task-detail.component.html',
  styleUrl: './jf-task-detail.component.scss'
})
export class JfTaskDetailComponent {
  nip: string
  pendingTaskList: PendingTask[] = []
  jf: JF = new JF()

  openedAccordion: string[] = []
  profileImageSrc: SafeUrl = 'assets/no-profile.jpg'

  pendingTaskloading$ = new BehaviorSubject<boolean>(true)
  detailTaskloading$ = new BehaviorSubject<boolean>(true)

  constructor (
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

  ngOnInit () {
    this.getJF()
    this.getTaskDetail()
    this.fetchPhotoProfile()
  }

  fetchPhotoProfile () {
    console.log('Fetching photo profile')
    this.apiService.getPhotoProfile(this.nip).subscribe({
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

  getTaskDetail () {
    this.apiService.getData(`/api/v1/jf/task/group/${this.nip}`).subscribe({
      next: (pendingTaskList: PendingTask[]) => {
        if (pendingTaskList.length == 0)
          this.router.navigate(['/siap/verify-user-jf'])
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

  toggleExpand (pendingTask: PendingTask) {
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
            switch (pendingTask.workflowName) {
              case 'jf_task':
                pendingTask['object'] = new JF(objectTask.object)
                break
              case 'rw_pendidikan_task':
                pendingTask['object'] = new RWPendidikan(objectTask.object)
                break
              case 'rw_pangkat_task':
                pendingTask['object'] = new RWPangkat(objectTask.object)
                break
              case 'rw_jabatan_task':
                pendingTask['object'] = new RWJabatan(objectTask.object)
                break
              case 'rw_kompetensi_task':
                pendingTask['object'] = new RWKompetensi(objectTask.object)
                break
              case 'rw_sertifikasi_task':
                pendingTask['object'] = new RWSertifikasi(objectTask.object)
                break
            }
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

  openConfirmationDialog (
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

  visibility (rwSertifikasi: any) {
    return () => rwSertifikasi.kategoriSertifikasiValue == 2
  }

  getTaskDate (date: string) {
    return this.converterService.dateToHumanReadable(date)
  }

  getJF () {
    this.jfService.findByNip(this.nip).subscribe({
      next: (jf: JF) => (this.jf = jf)
    })
  }

  submit (pendingTask: PendingTask) {
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
