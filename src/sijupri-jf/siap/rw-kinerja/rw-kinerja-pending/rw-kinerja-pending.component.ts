import { Component } from '@angular/core'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { CommonModule } from '@angular/common'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { RWKinerja } from '../../../../modules/siap/models/rw-kinerja.model'
import { PendingTask } from '../../../../modules/workflow/models/pending-task.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { Task } from '../../../../modules/workflow/models/task.model'
import { RatingKinerja } from '../../../../modules/maintenance/models/rating-kinerja.model'
import { PredikatKinerja } from '../../../../modules/maintenance/models/predikat-kinerja.model'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { BehaviorSubject } from 'rxjs'
import { fileValidator } from '../../../../modules/base/validators/file-format.validator'

@Component({
  selector: 'app-rw-kinerja-pending',
  standalone: true,
  imports: [
    PagableComponent,
    CommonModule,
    FormsModule,
    FileHandlerComponent,
    ReactiveFormsModule
  ],
  templateUrl: './rw-kinerja-pending.component.html',
  styleUrl: './rw-kinerja-pending.component.scss'
})
export class RwKinerjaPendingComponent {
  pagable: Pagable
  isDetailOpen: boolean = false
  rwKinerja: RWKinerja = new RWKinerja()
  ratingKinerjaList: RatingKinerja[] = []
  predikatKinerjaList: PredikatKinerja[] = []
  pendingTask: PendingTask

  rwKinerjaLoading$ = new BehaviorSubject<boolean>(false)
  predikatLoading$ = new BehaviorSubject<boolean>(false)
  ratingLoading$ = new BehaviorSubject<boolean>(false)
  submitLoading$ = new BehaviorSubject<boolean>(false)

  rwKinerjaForm!: FormGroup

  inputs: FIleHandler

  constructor (
    private apiService: ApiService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService
  ) {
    this.pagable = new PagableBuilder('/api/v1/rw_kinerja/task/search')
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Tanggal', 'dateCreated').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Angka Kredit', 'objectName').build()
      )
      .addPrimaryColumn(
        new PrimaryColumnBuilder('Status', 'taskStatus').build()
      )
      .addActionColumn(
        new ActionColumnBuilder()
          .setAction((pendingTask: PendingTask) => {
            this.pendingTask = pendingTask
            if (pendingTask.flowId == 'siap_flow_2') {
              this.getPendingRWKinerja(this.pendingTask.id)
              this.getRatingKinerjaList()
              this.getPredikatKinerjaList()
              this.isDetailOpen = true
            }
          }, 'info')
          .addInactiveCondition(
            (pendingTask: PendingTask) => pendingTask.flowId == 'siap_flow_1'
          )
          .withIcon('update')
          .build()
      )
      //   .addFilter(
      //     new PageFilterBuilder('like')
      //       .setProperty('objectName')
      //       .withField('Kinerja', 'text')
      //       .build()
      //   )
      .build()

    this.rwKinerjaForm = new FormGroup({
      dateEnd: new FormControl('', [Validators.required]),
      dateStart: new FormControl('', [Validators.required]),
      predikatKinerjaId: new FormControl('', [Validators.required]),
      ratingHasilId: new FormControl('', [Validators.required]),
      ratingKinerjaId: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      angkaKredit: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]+$')
      ]),
      fileDocEvaluasi: new FormControl('', [
        Validators.required,
        fileValidator(['application/pdf'], 2)
      ]),
      fileDocPredikat: new FormControl('', [
        Validators.required,
        fileValidator(['application/pdf'], 2)
      ]),
      fileDocAkumulasiAk: new FormControl('', [
        Validators.required,
        fileValidator(['application/pdf'], 2)
      ]),
      fileDocPenetapanAk: new FormControl('', [
        Validators.required,
        fileValidator(['application/pdf'], 2)
      ])
    })
  }

  fileLoadHandler () {
    this.inputs = {
      files: {
        docEvaluas: {
          label: 'Upload Dokumen Evaluasi',
          source: this.rwKinerja.docEvaluasiUrl,
          required: true
        },
        docPredikat: {
          label: 'Upload Dokumen Predikat',
          source: this.rwKinerja.docPredikatUrl,
          required: true
        },
        docAkumulasiAk: {
          label: 'Upload Dokumen Akumulasi Angka Kredit',
          source: this.rwKinerja.docAkumulasiAkUrl,
          required: true
        },
        docPenetapanAk: {
          label: 'Upload Dokumen Penetapan Angka Kredit',
          source: this.rwKinerja.docPenetapanAkUrl,
          required: true
        }
      },
      listen: (key: string, source: string, base64Data: string) => {
        if (key == 'docEvaluas')
          this.rwKinerjaForm.patchValue({ fileDocEvaluasi: base64Data })
        if (key == 'docPredikat')
          this.rwKinerjaForm.patchValue({ fileDocPredikat: base64Data })
        if (key == 'docAkumulasiAk')
          this.rwKinerjaForm.patchValue({ fileDocAkumulasiAk: base64Data })
        if (key == 'docPenetapanAk')
          this.rwKinerjaForm.patchValue({ fileDocPenetapanAk: base64Data })
      }
    }
  }

  getRatingKinerjaList () {
    this.ratingLoading$.next(true)
    this.apiService.getData(`/api/v1/rating_kinerja`).subscribe({
      next: response => {
        this.ratingKinerjaList = response.map(
          (ratingKinerja: { [key: string]: any }) =>
            new RatingKinerja(ratingKinerja)
        )
        this.ratingLoading$.next(false)
      },
      error: error => {
        console.log('error', error)
        this.alertService.showToast(
          'Error',
          'Gagal mendapatkan data rating kinerja!'
        )
        this.ratingLoading$.next(false)
      }
    })
  }

  getPredikatKinerjaList () {
    this.predikatLoading$.next(true)
    this.apiService.getData(`/api/v1/predikat_kinerja`).subscribe({
      next: response => {
        this.predikatKinerjaList = response.map(
          (predikatKinerja: { [key: string]: any }) =>
            new PredikatKinerja(predikatKinerja)
        )
        this.predikatLoading$.next(false)
      },
      error: error => {
        console.log('error', error)
        this.alertService.showToast(
          'Error',
          'Gagal mendapatkan data predikat kinerja!'
        )
        this.predikatLoading$.next(false)
      }
    })
  }

  getPendingRWKinerja (id: string) {
    this.rwKinerjaLoading$.next(true)
    this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
      next: response => {
        const pendingTask = new PendingTask(response)
        this.rwKinerja = new RWKinerja(pendingTask.objectTask.object)

        this.rwKinerjaForm.patchValue({
          dateEnd: this.rwKinerja.dateEnd,
          dateStart: this.rwKinerja.dateStart,
          predikatKinerjaId: this.rwKinerja.predikatKinerjaId,
          ratingHasilId: this.rwKinerja.ratingHasilId,
          ratingKinerjaId: this.rwKinerja.ratingKinerjaId,
          type: this.rwKinerja.type,
          angkaKredit: this.rwKinerja.angkaKredit
        })

        this.fileLoadHandler()
        this.rwKinerjaLoading$.next(false)
      },
      error: error => {
        console.log('error', error)
        this.alertService.showToast(
          'Error',
          'Gagal mendapatkan data riwayat kinerja!'
        )
        this.rwKinerjaLoading$.next(false)
      }
    })
  }

  back () {
    this.ratingKinerjaList.length = 0
    this.predikatKinerjaList.length = 0
    this.pendingTask = null
    this.isDetailOpen = false
    this.rwKinerja = new RWKinerja()
  }

  submit () {
    if (this.rwKinerjaForm.valid) {
      this.rwKinerja.dateEnd = this.rwKinerjaForm.value.dateEnd
      this.rwKinerja.dateStart = this.rwKinerjaForm.value.dateStart
      this.rwKinerja.predikatKinerjaId =
        this.rwKinerjaForm.value.predikatKinerjaId
      this.rwKinerja.ratingHasilId = this.rwKinerjaForm.value.ratingHasilId
      this.rwKinerja.ratingKinerjaId = this.rwKinerjaForm.value.ratingKinerjaId
      this.rwKinerja.type = this.rwKinerjaForm.value.type
      this.rwKinerja.angkaKredit = this.rwKinerjaForm.value.angkaKredit
      this.rwKinerja.fileDocEvaluasi = this.rwKinerjaForm.value.fileDocEvaluasi
      this.rwKinerja.fileDocPredikat = this.rwKinerjaForm.value.fileDocPredikat
      this.rwKinerja.fileDocAkumulasiAk =
        this.rwKinerjaForm.value.fileDocAkumulasiAk
      this.rwKinerja.fileDocPenetapanAk =
        this.rwKinerjaForm.value.fileDocPenetapanAk

      this.confirmationService.open(false).subscribe({
        next: result => {
          if (!result.confirmed) return
          this.submitLoading$.next(true)

          const task = new Task()
          task.id = this.pendingTask.id
          task.taskAction = 'approve'
          task.object = this.rwKinerja

          this.apiService
            .postData(`/api/v1/rw_kinerja/task/submit`, task)
            .subscribe({
              next: () => {
                this.alertService.showToast(
                  'Success',
                  'Berhasil mengubah data riwayat kinerja.'
                )
                this.submitLoading$.next(false)
                this.back()
              },
              error: error => {
                console.log('error', error)
                this.alertService.showToast(
                  'Error',
                  'Gagal mengubah data riwayat kinerja!'
                )
                this.submitLoading$.next(false)
              }
            })
        }
      })
    }
  }
}
