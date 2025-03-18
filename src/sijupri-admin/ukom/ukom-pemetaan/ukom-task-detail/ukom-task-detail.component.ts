import { Component } from '@angular/core'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { Pangkat } from '../../../../modules/maintenance/models/pangkat.model'
import { CommonModule } from '@angular/common'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { ApiService } from '../../../../modules/base/services/api.service'
import { UkomTaskDetail } from '../../../../modules/ukom/models/ukom-task-detail.modal'
import { CATSchore } from '../../../../modules/ukom/models/cat/cat-schore'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { DataDokumenUkom } from '../../../../modules/ukom/models/data-dukung'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
@Component({
  selector: 'app-ukom-task-detail',
  standalone: true,
  imports: [CommonModule, ModalComponent, FileHandlerComponent],
  templateUrl: './ukom-task-detail.component.html',
  styleUrl: './ukom-task-detail.component.scss'
})
export class UkomTaskDetailComponent {
  participant_ukom_id: string
  jabatan: Jabatan = new Jabatan()
  jenjang: Jenjang = new Jenjang()
  pangkat: Pangkat = new Pangkat()
  CATSchore: CATSchore = new CATSchore()
  dataDokumenUkom: DataDokumenUkom[] = []

  ukomDetail = new UkomTaskDetail()
  ukomDetailLoading$ = new BehaviorSubject<boolean>(false)
  isModalOpen$ = new BehaviorSubject<boolean>(false)

  fileHandlerData: FIleHandler = {
    files: {},
    viewOnly: true
  }

  constructor (
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit () {
    this.activatedRoute.paramMap.subscribe(params => {
      this.participant_ukom_id = params.get('id')
      this.getParticipantUkomDetail()
      this.getDokumenUkomList()
    })
  }

  toggleModal () {
    this.isModalOpen$.next(!this.isModalOpen$.value)
  }

  getCATScore () {
    const exam_type_code = 'CAT'

    this.apiService
      .getData(
        `/api/v1/exam_grade/${exam_type_code}/${this.participant_ukom_id}`
      )
      .subscribe({
        next: (response: any) => {
          this.CATSchore = new CATSchore(response)
        }
      })
  }

  back () {
    history.back()
  }

  getParticipantUkomDetail () {
    this.ukomDetailLoading$.next(true)
    this.apiService
      .getData(`/api/v1/participant_ukom/${this.participant_ukom_id}`)
      .subscribe({
        next: response => {
          this.ukomDetail = response
          this.getCATScore()

          console.log(this.ukomDetail)
          this.ukomDetailLoading$.next(false)
        },
        error: error => {
          this.ukomDetailLoading$.next(false)
          console.log(error)
        }
      })
  }

  mapDokumenUkom () {
    this.dataDokumenUkom.forEach((doc, index) => {
      this.fileHandlerData.files[`file${index}`] = {
        label: doc.dokumenPersyaratanName,
        source: doc.dokumenUrl,
        id: doc.id,
        required: false
      }
    })
  }

  getDokumenUkomList () {
    this.apiService
      .getData(`/api/v1/document_ukom/participant/${this.participant_ukom_id}`)
      .subscribe({
        next: (response: DataDokumenUkom[]) => {
          this.dataDokumenUkom = response
          this.mapDokumenUkom()
        },
        error: error => {
          console.log(error)
        }
      })
  }

  getCorrectAnswer (question: any): string {
    const correctChoice = question.multipleChoiceDtoList.find(
      (choice: any) => choice.correct
    )
    return correctChoice ? correctChoice.choiceId : ''
  }
}
