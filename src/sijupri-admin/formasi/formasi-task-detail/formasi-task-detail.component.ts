import { Component } from '@angular/core'
import { FormasiRequest } from '../../../modules/formasi/models/formasi-request.model'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { CommonModule } from '@angular/common'
import { UnitKerja } from '../../../modules/maintenance/models/unit-kerja.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { Formasi } from '../../../modules/formasi/models/formasi.model'
import { take } from 'rxjs'
import { Task } from '../../../modules/workflow/models/task.model'
import { ConfirmationService } from '../../../modules/base/services/confirmation.service'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { PrevPendingTask } from '../../../modules/formasi/models/prev-pending-task'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { LucideAngularModule } from 'lucide-angular'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
  FormArray
} from '@angular/forms'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { AvailableFormation } from '../../../modules/formasi/models/available-formasi.model'
import { Jenjang } from '../../../modules/maintenance/models/jenjang.modle'
import { Observable, map } from 'rxjs'
import { Router } from '@angular/router'
@Component({
  selector: 'app-formasi-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileHandlerComponent,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './formasi-task-detail.component.html',
  styleUrl: './formasi-task-detail.component.scss'
})
export class FormasiTaskDetailComponent {
  pendingTask: PendingTask = new PendingTask()
  formasiRequest: FormasiRequest = new FormasiRequest()
  unitKerja: UnitKerja = new UnitKerja()
  formasiList: Formasi[] = []
  //   jenjangList$: Observable<Jenjang[]>
  JenjangList: Jenjang[] = []
  //   formasiList: AvailableFormation[] = []

  pendingTaskId: string = ''
  unit_kerja_id: string = ''
  isApproveEnable: boolean = true

  prevPendingTask: PrevPendingTask
  prevApprovedTask: any[] = []
  task = new Task()

  fileRekomendasi: string = ''
  //   task = this.object

  jabatanMapping: { [key: string]: string } = {
    JB1: 'Analis Perdagangan',
    JB4: 'Pengawas Perdagangan',
    JB7: 'Penguji Mutu Barang',
    JB8: 'Pengawas Kemetrologian',
    JB10: 'Pengamat Tera',
    JB11: 'Penera'
  }

  waktuInput: {
    fileUndangan?: string
  } = {}

  inputs: FIleHandler = {
    files: {
      question_template: { label: 'Surat Undangan' }
    },
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      switch (key) {
        case 'question_template':
          this.waktuInput.fileUndangan = base64Data
          break
      }
    }
  }

  inputsFileRekomendasi: FIleHandler = {
    files: {
      file_rekomendasi: { label: 'Rekomendasi Formasi' }
    },
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      switch (key) {
        case 'file_rekomendasi':
          this.fileRekomendasi = base64Data
          break
      }
    }
  }

  flow3Form: FormGroup
  waktuPelaksanaanForm: FormGroup

  constructor (
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private filePreviewService: FilePreviewService,
    private handlerService: HandlerService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // this.activatedRoute.paramMap.subscribe(params => {
    //   this.pendingTaskId = params.get('id')
    // })
    this.activatedRoute.paramMap.subscribe(params => {
      this.unit_kerja_id = params.get('id')
    })

    this.waktuPelaksanaanForm = new FormGroup({
      waktuPelaksanaan: new FormControl('')
    })

    this.flow3Form = this.fb.group({})

    this.getListJenjang()
  }

  ngOnInit () {
    this.getPendingTask()
  }

  hoveredJabatanIndex: number | null = null

  hoverJabatan (index: number, isHovering: boolean) {
    this.hoveredJabatanIndex = isHovering ? index : null
  }

  getPendingTask () {
    this.apiService
      //   .getData(`/api/v1/pending_task/${this.pendingTaskId}`)
      .getData(`/api/v1/formasi/task/unit_kerja/${this.unit_kerja_id}`)
      .subscribe({
        next: response => {
          this.pendingTask = new PendingTask(response)
          this.formasiRequest = new FormasiRequest(
            this.pendingTask.objectTask.object
            // this.pendingTask
          )

          this.prevPendingTask = new PrevPendingTask(
            this.pendingTask.objectTask.prevObject
          )

          if (this.formasiRequest.unitKerjaId) {
            this.getUnitKerja(this.formasiRequest.unitKerjaId)
          }

          this.findApproveDokumen(this.prevPendingTask.formasiDokumenList)
          this.getPendingFormasi(this.pendingTask.objectId)

          console.log('pendingTa222sk', this.formasiRequest.formasiDokumenList)
          //   for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
          //     formasiDokumen.dokumenStatus = 'APPROVE'
          //   }
        },
        error: error => {
          console.error('Error fetching data', error)

          //   this.alertService.showToast('Error', error.message)
          //   throw error
        }
      })
  }

  initializeForm () {
    console.log('formasiList', this.formasiList)
    this.formasiList.forEach((item, i) => {
      item.formasiResultDtoList.forEach((formasi, j) => {
        const controlName = `formasi_${i}_${j}`
        this.flow3Form.addControl(
          controlName,
          new FormControl(formasi.pembulatan || '0')
        )
      })
    })
  }

  getTotalRekapitulasi (): number {
    let total = 0
    this.formasiList.forEach(item => {
      item.formasiResultDtoList.forEach(formasi => {
        total += formasi.pembulatan || 0
      })
    })
    return total
  }

  getTotalRekomendasi (): number {
    let total = 0
    this.formasiList.forEach((item, i) => {
      item.formasiResultDtoList.forEach((formasi, j) => {
        const controlName = `formasi_${i}_${j}`
        const value = this.flow3Form.get(controlName)?.value || 0
        total += +value // Convert to number
      })
    })
    return total
  }

  getListJenjang () {
    this.apiService.getData(`/api/v1/jenjang`).subscribe({
      next: res => {
        this.JenjangList = res.map(
          (jenjang: { [key: string]: any }) => new Jenjang(jenjang)
        )
      }
    })
  }

  findJenjangName (jenjangCode: string): string {
    const jenjang = this.JenjangList.find(
      jenjang => jenjang.code === jenjangCode
    )
    return jenjang?.name || ''
  }

  findApproveDokumen (dokumenFormasiList: any[]) {
    this.prevApprovedTask = dokumenFormasiList.filter(
      dokumen => dokumen.dokumenStatus === 'APPROVE'
    )
    console.log('prevApprovedTask', this.prevApprovedTask)
  }

  isDocumentApproved (dokumenPersyaratanId: string): boolean {
    return this.prevApprovedTask.some(
      approvedDokumen =>
        approvedDokumen.dokumenPersyaratanId === dokumenPersyaratanId
    )
  }

  getUnitKerja (unitKerjaId: string) {
    console.log('aaaa232', unitKerjaId)

    this.apiService.getData(`/api/v1/unit_kerja/${unitKerjaId}`).subscribe({
      next: response => {
        console.log('aaaa', this.unitKerja)

        this.unitKerja = new UnitKerja(response)
      },
      error: error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', error.message)
        throw error
      }
    })
  }

  getPendingFormasi (formasi_id: string) {
    this.apiService
      .getData(`/api/v1/formasi_detail/formasi/${formasi_id}`)
      //   .getData(`/api/v1/formasi_detail/jabatan_list`)
      .subscribe({
        next: response => {
          console.log('n', response)
          this.formasiList = response.map(
            (formasi: { [key: string]: any }) => new Formasi(formasi)
          )
          this.initializeForm()

          console.log('b', this.formasiList)
        },
        error: error => {
          console.error('Error fetching data', error)
          this.alertService.showToast('Error', error.message)
          throw error
        }
      })
  }

  onFileChange (event: any) {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        this.formasiRequest.fileRekomendasi = reader.result as string
      }

      reader.onerror = error => {
        console.error('Error: ', error)
      }
    }
  }

  onFIleSwitch (index: number, status: 'APPROVE' | 'REJECT') {
    this.formasiRequest.formasiDokumenList[index].dokumenStatus = status

    for (const formasiDokumen of this.formasiRequest.formasiDokumenList) {
      if (formasiDokumen.dokumenStatus == 'REJECT') {
        this.isApproveEnable = false
        break
      }
      this.isApproveEnable = true
    }
  }

  submitFl2 (isApprove: boolean) {
    this.task.id = this.pendingTask.id
    this.task.taskAction = isApprove ? 'approve' : 'reject'

    if (isApprove) {
      const waktuPelaksanaan =
        this.waktuPelaksanaanForm.get('waktuPelaksanaan')?.value
      console.log('waktuPelaksanaan', waktuPelaksanaan)

      if (waktuPelaksanaan === '') {
        this.handlerService.handleAlert(
          'Error',
          'Waktu Pelaksanaan tidak boleh kosong'
        )
        return
      }

      if (
        this.waktuInput.fileUndangan === undefined ||
        this.waktuInput.fileUndangan === '' ||
        this.waktuInput.fileUndangan === null
      ) {
        this.handlerService.handleAlert(
          'Error',
          'Surat Undangan tidak boleh kosong'
        )
        return
      }
      this.task.object.waktuPelaksanaan = waktuPelaksanaan
      this.task.object.fileSuratUndangan = this.waktuInput.fileUndangan
    }

    if (!isApprove) {
      const rejectedDokumenUkomList =
        this.formasiRequest.formasiDokumenList.filter(
          dokumen => dokumen.dokumenStatus === 'REJECT'
        )

      if (rejectedDokumenUkomList.length > 0) {
        this.task.object = {
          formasi_dokumen_list: rejectedDokumenUkomList
        }
      }
    }

    this.confirmationService.open(!isApprove).subscribe({
      next: result => {
        if (!result.confirmed) return
        this.task.remark = result.comment || null

        console.log('task', this.task)
        // return
        this.apiService
          .postData(`/api/v1/formasi/task/submit`, this.task)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )

              setTimeout(() => {
                window.location.reload()
              }, 1000)
            },
            error: error => {
              console.error('Error fetching data', error)
              this.handlerService.handleAlert('Error', 'Gagal mengirim data')
            }
          })
      }
    })
  }

  submitFl3 () {
    const formasiDetailDtoList = this.formasiList.map((item, i) => ({
      id: item.id,
      formasiResultDtoList: item.formasiResultDtoList.map((formasi, j) => ({
        id: formasi.id,
        result: this.flow3Form.get(`formasi_${i}_${j}`)?.value.toString()
      }))
    }))

    const payload = {
      id: this.pendingTask.id, // Replace with actual ID
      taskAction: 'approve',
      object: {
        id: this.pendingTask.objectId, // Replace with actual formasi_id
        formasiDetailDtoList: formasiDetailDtoList
      }
    }

    console.log('payload', payload)

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return
        console.log('Form submitted successfully', payload)
        this.apiService
          .postData(`/api/v1/formasi/task/submit`, payload)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            },
            error: error => {
              console.error('Error fetching data', error)
              this.handlerService.handleAlert('Error', 'Gagal mengirim data')
            }
          })
      }
    })
  }

  submitFl5 () {
    const payload = {
      id: this.pendingTask.id,
      task_action: 'approve',
      object: {
        fileRekomendasi: this.fileRekomendasi
      }
    }

    // console.log('payload', payload)
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService
          .postData(`/api/v1/formasi/task/submit`, payload)
          .subscribe({
            next: () => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              this.router.navigate(['/formasi/formasi-task-list'])
            },
            error: error => {
              console.error('Error fetching data', error)
              this.handlerService.handleAlert('Error', 'Gagal mengirim data')
            }
          })
      }
    })
  }

  preview (fileName: string, source: string) {
    this.filePreviewService.open(fileName, source)
  }
}
