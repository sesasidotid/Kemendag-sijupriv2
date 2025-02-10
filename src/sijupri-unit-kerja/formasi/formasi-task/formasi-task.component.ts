import { ConverterService } from './../../../modules/base/services/converter.service'
import { ConfirmationService } from './../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { PendingTask } from '../../../modules/workflow/models/pending-task.model'
import { FormasiDokumenComponent } from './formasi-dokumen/formasi-dokumen.component'
import { LoginContext } from '../../../modules/base/commons/login-context'
import { CommonModule } from '@angular/common'
import { FormasiRequestComponent } from './formasi-request/formasi-request.component'
import { ObjectTask } from '../../../modules/workflow/models/object-task.model'
import { Task } from '../../../modules/workflow/models/task.model'
import { ApiService } from '../../../modules/base/services/api.service'
import { AlertService } from '../../../modules/base/services/alert.service'
import { FormasiDokumen } from '../../../modules/formasi/models/formasi-dokumen.model'
import { FormasiRequest } from '../../../modules/formasi/models/formasi-request.model'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { HandlerService } from '../../../modules/base/services/handler.service'
import { FileHandlerComponent } from '../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../modules/base/commons/file-handler/file-handler'
import { PengaturanFormasiJabatan } from '../../../modules/formasi/models/formasi-pengaturan-jabatan.model'
import { BehaviorSubject, Observable } from 'rxjs'
import { ModalComponent } from '../../../modules/base/components/modal/modal.component'
import { FilePreviewService } from '../../../modules/base/services/file-preview.service'
import { UndanganVerifikasiFormasi } from '../../../modules/formasi/models/undangan.model'
import { EmptyStateComponent } from '../../../modules/base/components/empty-state/empty-state.component'
@Component({
  selector: 'app-formasi-task',
  standalone: true,
  imports: [
    CommonModule,
    FormasiDokumenComponent,
    FormasiRequestComponent,
    FormsModule,
    ModalComponent,
    FileHandlerComponent,
    ReactiveFormsModule,
    EmptyStateComponent
  ],
  templateUrl: './formasi-task.component.html',
  styleUrl: './formasi-task.component.scss'
})
export class FormasiTaskComponent {
  pendingTask: PendingTask = null
  objectTask: ObjectTask = null
  isRequestPage: boolean = false
  formasiDokumenList: FormasiDokumen[] = []
  formasiRequest: FormasiRequest = new FormasiRequest()

  flowIds = ['for_flow_1', 'for_flow_4']
  flowId: string = null

  currentFormasiStep$ = new BehaviorSubject<number>(1)
  formasiStep$ = new BehaviorSubject<number>(1)
  groupedFormasiPendingTaskHistory: { [key: string]: any[] } = {}
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  object: {
    objectFormasiDokumenId?: string
    objectFormasiJb1Id?: string
    objectFormasiJb2Id?: string
    objectFormasiJb3Id?: string
    objectFormasiJb4Id?: string
    objectFormasiJb5Id?: string
    objectFormasiJb6Id?: string
    objectFormasiJb7Id?: string
    objectFormasiJb8Id?: string
    objectFormasiJb9Id?: string
    objectFormasiJb10Id?: string
    objectFormasiJb11Id?: string
  } = {}

  detectedDokumen: any = {}
  rejectedDokumen: any[] = []

  revisiedFormasiDokumen: any[] = []
  PengaturanFormasiJabatan: PengaturanFormasiJabatan[] = []

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

  undangan: UndanganVerifikasiFormasi[] = []

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private handlerService: HandlerService,
    private converterService: ConverterService,
    private filePreviewService: FilePreviewService
  ) {}

  groupAndSortTasksByFlowId (tasks: any[]): { [key: string]: any[] } {
    const grouped = tasks.reduce((acc, task) => {
      if (
        task.flowId === 'for_flow_2' ||
        task.flowId === 'for_flow_4' ||
        task.flowId === 'for_flow_3' ||
        task.flowId === 'for_flow_5'
      ) {
        if (!acc[task.flowId]) {
          acc[task.flowId] = []
        }
        acc[task.flowId].push(task)
      }
      return acc
    }, {} as { [key: string]: any[] })

    Object.keys(grouped).forEach(flowId => {
      grouped[flowId].sort((a: any, b: any) => {
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        ) // Descending order
      })
    })

    const flowOrder = ['for_flow_2', 'for_flow_4', 'for_flow_3', 'for_flow_5']
    const sortedGrouped: { [key: string]: any[] } = {}

    flowOrder.forEach(flowId => {
      if (grouped[flowId]) {
        sortedGrouped[flowId] = grouped[flowId]
      }
    })

    return sortedGrouped
  }

  ngOnInit () {
    this.getPendingTask()
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  convertDate (date: string) {
    return this.converterService.dateToHumanReadable(date)
  }

  getPendingTask () {
    this.apiService
      .getData(
        `/api/v1/formasi/task/unit_kerja/${LoginContext.getUnitKerjaId()}`
      )
      .subscribe({
        next: response => {
          console.log('response', response)
          this.pendingTask = new PendingTask(response)
          this.flowId = this.pendingTask.flowId
          console.log('this.flowId', this.flowId)
          this.objectTask = this.pendingTask.objectTask
          this.isRequestPage = true
          this.getRejectedDokumen()
          this.getPengaturanFormasiJabatan()

          switch (this.pendingTask.flowId) {
            case 'for_flow_2':
              this.formasiStep$.next(1)
              this.currentFormasiStep$.next(1)
              break
            case 'for_flow_4':
              this.formasiStep$.next(2)
              this.currentFormasiStep$.next(2)
              break
            case 'for_flow_3':
              this.formasiStep$.next(3)
              this.currentFormasiStep$.next(3)
              break
            case 'for_flow_5':
              this.formasiStep$.next(4)
              this.currentFormasiStep$.next(4)
              break
            default:
              break
          }

          this.getUndangan(this.pendingTask.objectId)
          if (this.pendingTask.pendingTaskHistory.length > 0) {
            this.groupedFormasiPendingTaskHistory =
              this.groupAndSortTasksByFlowId(
                this.pendingTask.pendingTaskHistory
              )
            console.log(
              'groupedUkomPendingTaskHistory',
              this.groupedFormasiPendingTaskHistory
            )
          }

          //   if (this.flowId == 'for_flow_4') {
          //     this.formasiRequest = new FormasiRequest(this.objectTask.object)
          //     this.formasiDokumenList = []
          //     for (const formasiDokumen of this.formasiRequest
          //       .formasiDokumenList) {
          //       this.formasiDokumenList.push(formasiDokumen)
          //     }
          //   }
        },
        error: () => {
          console.log('error this.flowId', this.flowId)

          this.isRequestPage = false
        }
      })
  }

  preview (fileName: string, source: string) {
    this.filePreviewService.open(fileName, source)
  }

  getUndangan (formasiId: string) {
    this.apiService
      .getData(`/api/v1/formasi_proses/search?eq_formasiId=${formasiId}`)
      .subscribe({
        next: (res: any) => {
          this.undangan = res.data.map(
            (data: any) => new UndanganVerifikasiFormasi(data)
          )
          console.log('formasiId', this.undangan)
        }
      })
  }

  getRejectedDokumen () {
    console.log('this.pendingTask', this.pendingTask)
    if (this.pendingTask?.formasiDokumenList?.length) {
      this.rejectedDokumen = this.pendingTask.formasiDokumenList.filter(
        dokumen => dokumen.dokumenStatus.toLowerCase() === 'reject'
      )
      console.log('rejectedDokumen', this.rejectedDokumen)
      this.handleRejectedDokumen()
    } else {
      console.warn('No documents found in pendingTask.dokumenUkomList')
    }
  }

  handleRejectedDokumen () {
    this.inputs.files = {}
    this.rejectedDokumen.forEach((dokumen, index) => {
      const key = `rejectedDokumen_${index + 1}`
      this.inputs.files[key] = {
        label: dokumen.dokumenPersyaratanName || 'Unknown Document'
      }
    })

    console.log('this.inputs.files', this.inputs.files)
  }

  isAnyFileMissing (): boolean {
    return Object.keys(this.inputs.files).some(key => {
      return !this.detectedDokumen[key]
    })
  }

  getPengaturanFormasiJabatan () {
    this.apiService
      .getData(`/api/v1/formasi_detail/formasi/${this.pendingTask.objectId}`)
      .subscribe({
        next: response => {
          this.PengaturanFormasiJabatan = response
        },
        error: () => {
          console.warn('No documents found in pendingTask.dokumenUkomList')
          this.handlerService.handleAlert(
            'Error',
            'Mengambil data pengaturan formasi jabatan error'
          )
        }
      })
  }

  isAllFl1Submitted () {
    const requiredJabatanCodes = ['JB11', 'JB10', 'JB8', 'JB7', 'JB4', 'JB1']

    return requiredJabatanCodes.every(code =>
      this.PengaturanFormasiJabatan.some(
        jabatan => jabatan.jabatanCode === code
      )
    )
  }

  //confirmation gk mau muncul, BUGGED
  submitFl1 () {
    // this.confirmationService.open(false).subscribe({
    //   next: result => {
    //     console.log('Dialog result:', result)

    //     if (!result.confirmed) return

    this.apiService
      .postData('/api/v1/formasi/task/submit', {
        id: this.pendingTask.id,
        task_action: 'approve'
      })
      .subscribe({
        next: res => {
          window.location.reload()
        },
        error: err => {
          console.error('Error fetching data', err)
          this.handlerService.handleAlert(
            'Error',
            'Gagal Menyimpan Data. Pastikan Data Sudah Lengkap'
          )
        }
      })
    //   },
    //   error: err => {
    //     console.error('Error fetching data', err)
    //     this.handlerService.handleAlert('Error', 'Gagal Menyimpan Data')
    //   },
    //   complete: () => {
    //     console.log('complete')
    //   }
    // })
  }

  onFileChange (event: any, index: number) {
    const file = event.target.files[0]

    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = () => {
        this.formasiDokumenList[index].dokumenStatus = 'PENDING'
        this.formasiDokumenList[index].dokumenFile = reader.result as string
      }

      reader.onerror = error => {
        console.error('Error: ', error)
      }
    }
  }

  handleStepClick (clickedStep: number) {
    this.currentFormasiStep$.subscribe(step => {
      if (clickedStep <= step) {
        this.formasiStep$.next(clickedStep)
      }
    })
  }

  submitFl4 () {
    if (!Array.isArray(this.revisiedFormasiDokumen)) {
      this.revisiedFormasiDokumen = []
    }

    const documentMap = new Map()

    for (const key in this.detectedDokumen) {
      if (this.detectedDokumen.hasOwnProperty(key)) {
        const detected = this.detectedDokumen[key]

        const dokumen = this.pendingTask.formasiDokumenList.find(
          dok =>
            dok.dokumenPersyaratanName === detected.label &&
            dok.dokumenStatus === 'REJECT'
        )

        if (dokumen) {
          const newDoc = {
            dokumenFile: detected.base64,
            dokumenPersyaratanName: `${
              this.pendingTask.id
            }_dokumenPersaratanFormasi_${Date.now()}`,
            dokumenPersyaratanId: dokumen.dokumenPersyaratanId,
            dokumenStatus: 'APPROVE'
          }

          documentMap.set(dokumen.dokumenPersyaratanId, newDoc)
        }
      }
    }

    this.revisiedFormasiDokumen = Array.from(documentMap.values())

    // this.confirmationService.open(false).subscribe({
    //   next: response => {
    //     if (!response.confirmed) {
    //       return
    //     }
    const task = new Task({
      id: this.pendingTask.id,
      taskAction: 'approve',
      object: { formasi_dokumen_list: this.revisiedFormasiDokumen }
    })

    this.apiService.postData(`/api/v1/formasi/task/submit`, task).subscribe({
      next: () => window.location.reload(),

      error: error => {
        console.error('Error fetching data', error)
        this.alertService.showToast('Error', error.message)
        throw error
      }
    })
    //   },
    //   error: error => {
    //     console.error('Error fetching data', error)
    //   },
    //   complete: () => {
    //     console.log('complete')
    //   }
    // })
  }

  ngOnDestroy () {
    this.formasiStep$.unsubscribe()
    this.currentFormasiStep$.unsubscribe()
  }
}
