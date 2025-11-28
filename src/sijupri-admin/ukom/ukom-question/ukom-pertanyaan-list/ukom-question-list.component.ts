import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { Component } from '@angular/core'
import { TabService } from '@/modules/base/services/tab.service'
import { CommonModule } from '@angular/common'
import { HandlerService } from '@/modules/base/services/handler.service'
import { BehaviorSubject } from 'rxjs'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { ExamType } from '@/modules/ukom/models/exam-type'
import { ApiService } from '@/modules/base/services/api.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { FormValidationService } from '@/modules/base/services/form-validation.service'

@Component({
    selector: 'app-ukom-question-list',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        FormsModule,
        ReactiveFormsModule,
    ],
    templateUrl: './ukom-question-list.component.html',
    styleUrl: './ukom-question-list.component.scss',
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
            question_template: { label: 'File Pertanyaan' },
        },
        allowedTypes: [
            { label: 'xls', type: 'application/vnd.ms-excel' },
            {
                label: 'xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
        listen: (key: string, base64Data: string) => {
            switch (key) {
                case 'question_template':
                    this.buldPertanyaan.file_question = base64Data
                    break
            }
        },
    }

    isLoading$ = new BehaviorSubject<boolean>(false)

    constructor(
        private tabService: TabService,
        private handlerService: HandlerService,
        private apiService: ApiService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.getExamTypeList()
        this.handleFormInit()
        this.handleTabService()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.templatePertanyaanForm.get(controlName),
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.templatePertanyaanForm = new FormGroup({
            jenis_ukom_code: new FormControl('', Validators.required),
        })
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService.addTab({
            label: 'Template Pertanyaan',
            isActive: true,
            icon: 'mdi-file-download',
            onClick: () => this.handleDownloadTemplate(),
        })
    }

    handleDownloadTemplate() {
        this.apiService
            .getDownload('/api/v1/ukom_module/download/CAT')
            .subscribe({
                error: (err) =>
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengunduh template pertanyaan',
                    ),
            })
    }

    getExamTypeList() {
        this.examTypeList$ = this.apiService
            .getData('/api/v1/exam_type')
            .pipe(
                map((response) =>
                    response.map(
                        (examType: { [key: string]: any }) =>
                            new ExamType(examType),
                    ),
                ),
            )
    }

    isAnyFileMissing(): boolean {
        return !this.buldPertanyaan.file_question
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return
                this.isLoading$.next(true)

                this.buldPertanyaan.exam_type =
                    this.templatePertanyaanForm.get('jenis_ukom_code')?.value

                this.apiService
                    .postData(
                        '/api/v1/ukom_module/save/bulk',
                        this.buldPertanyaan,
                    )
                    .subscribe({
                        next: (response) => {
                            this.isLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan pertanyaan',
                            )

                            setTimeout(() => {
                                window.location.reload()
                            }, 1000)
                        },
                        error: (error) => {
                            this.isLoading$.next(false)
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menambahkan pertanyaan, pastikan format file benar',
                            )
                        },
                    })
            },
        })
    }
}
