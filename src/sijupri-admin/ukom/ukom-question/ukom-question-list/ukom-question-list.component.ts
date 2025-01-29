import { Pertanyaan } from './../../../../modules/akp/models/pertanyaan.model'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
  ActionColumnBuilder,
  PagableBuilder,
  PageFilterBuilder,
  PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { TabService } from '../../../../modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { BehaviorSubject } from 'rxjs'
import { UkomQuestionAddComponent } from '../ukom-question-add/ukom-question-add.component'
import { UkomExamScheduleAddComponent } from '../../ukom-exam-schedule/ukom-exam-schedule-add/ukom-exam-schedule-add.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ExamType } from '../../../../modules/ukom/models/exam-type'
import { ApiService } from '../../../../modules/base/services/api.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'

@Component({
  selector: 'app-ukom-question-list',
  standalone: true,
  imports: [
    PagableComponent,
    CommonModule,
    UkomQuestionAddComponent,
    FileHandlerComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './ukom-question-list.component.html',
  styleUrl: './ukom-question-list.component.scss'
})
export class UkomQuestionListComponent {
  tab$ = new BehaviorSubject<number | null>(0)

  examTypeList$: Observable<ExamType[]>
  templatePertanyaanForm: FormGroup

  buldPertanyaan: {
    exam_type?: string
    file_question?: string
  } = {}

  inputs: FIleHandler = {
    files: {
      question_template: { label: 'File Template Pertanyaan' }
    },
    listen: (
      key: string,
      source: string,
      base64Data: string,
      label: string
    ) => {
      switch (key) {
        case 'question_template':
          this.buldPertanyaan.file_question = base64Data
          break
      }
    }
  }

  constructor (
    private tabService: TabService,
    private router: Router,
    private handlerService: HandlerService,
    private apiService: ApiService,
    private confirmationService: ConfirmationService
  ) {
    this.getExamTypeList()

    this.templatePertanyaanForm = new FormGroup({
      jenis_ukom_code: new FormControl('', Validators.required)
    })
  }

  ngOnInit () {
    if (this.tabService.getTabsLength() > 0) {
      this.tabService.clearTabs()
    }

    this.tabService
      //   .addTab({
      //     label: 'Daftar Pertanyaan',
      //     isActive: true,
      //     icon: 'mdi-list-box',
      //     onClick: () => this.handleDownloadTemplate()
      //   })
      //   .addTab({
      //     label: 'Tambah Pertanyaan}',
      //     icon: 'mdi-plus-circle',
      //     onClick: () => this.handleTabChange(1)
      //   })
      .addTab({
        label: 'Template Pertanyaan',
        isActive: true,
        icon: 'mdi-file-download',
        onClick: () => this.handleDownloadTemplate()
      })
  }

  handleTabChange (tab?: number) {
    console.log('tab', tab)

    this.tab$.next(tab)
    this.tabService.changeTabActive(tab)
  }

  handleDownloadTemplate () {
    this.apiService.getDownload('/api/v1/ukom_module/download/CAT').subscribe({
      error: err =>
        this.handlerService.handleAlert(
          'Error',
          'Gagal mengunduh template pertanyaan'
        )
    })
  }

  getExamTypeList () {
    this.examTypeList$ = this.apiService
      .getData('/api/v1/exam_type')
      .pipe(
        map(response =>
          response.map(
            (examType: { [key: string]: any }) => new ExamType(examType)
          )
        )
      )

    this.examTypeList$.subscribe(examTypeList => {
      console.log(examTypeList)
    })
  }

  submit () {
    this.buldPertanyaan.exam_type =
      this.templatePertanyaanForm.get('jenis_ukom_code')?.value
    console.log(this.buldPertanyaan)

    this.confirmationService.open(false).subscribe({
      next: result => {
        if (!result.confirmed) return

        this.apiService
          .postData('/api/v1/ukom_module/save/bulk', this.buldPertanyaan)
          .subscribe({
            next: response => {
              this.handlerService.handleAlert(
                'Success',
                'Berhasil menambahkan pertanyaan'
              )
              window.location.reload()
              //   this.router.navigate(['/ukom/ukom-question'])
              // window.re
            },
            error: error => this.handlerService.handleException(error)
          })
      }
    })
  }
}
