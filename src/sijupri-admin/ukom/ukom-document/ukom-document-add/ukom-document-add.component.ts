import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { Router, RouterLink } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ExamScheduleUkom } from '../../../../modules/ukom/models/schedule.model'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { RoomUkomDetail } from '../../../../modules/ukom/models/room-ukom-detail'
import { map } from 'rxjs/operators'
import { JenisUkom } from '../../../../modules/ukom/models/jenis-ukom'
import { DataDokumenUkom } from '../../../../modules/ukom/models/data-dukung'
@Component({
  selector: 'app-ukom-document-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-document-add.component.html',
  styleUrl: './ukom-document-add.component.scss'
})
export class UkomDocumentAddComponent {
  @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
  tab$ = new BehaviorSubject<number | null>(0)

  documentForm: FormGroup
  submitLoading$ = new BehaviorSubject<boolean>(false)

  documentData: DataDokumenUkom = new DataDokumenUkom()

  constructor (
    private confirmationService: ConfirmationService,
    private router: Router,
    private apiService: ApiService,
    private handlerService: HandlerService
  ) {
    this.documentForm = new FormGroup({
      dokumenPersyaratanName: new FormControl('', Validators.required),
      jenisUkom: new FormControl('', Validators.required)
    })
  }
  submit () {
    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.submitLoading$.next(true)

        this.documentData.dokumenPersyaratanName = this.documentForm.get(
          'dokumenPersyaratanName'
        )?.value
        this.documentData.jenisUkom = this.documentForm.get('jenisUkom')?.value
        console.log(this.documentData)

        this.apiService
          .postData(
            `/api/v1/document_ukom/dokumen_persyaratan`,
            this.documentData
          )
          .subscribe({
            next: response => {
              this.handlerService.handleAlert(
                'Success',
                'Data berhasil disimpan'
              )
              //   this.router.navigate(['/ukom/ukom-document-list'])
              this.changeTabActive.emit(0)
            },
            error: error => {
              this.handlerService.handleAlert('Error', error.error.message)
            },
            complete: () => {
              this.submitLoading$.next(false)
            }
          })
      }
    })
  }
}
