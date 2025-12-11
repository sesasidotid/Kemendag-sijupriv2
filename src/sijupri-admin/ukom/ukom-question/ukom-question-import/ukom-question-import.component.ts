import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { UkomModulesService } from '@/modules/ukom/services/ukom-modules.service'
import { Component, ViewChild, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ExamType } from '@/modules/ukom/models/exam-type.model'
import { finalize, Observable } from 'rxjs'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ImportQuestionRequest } from '@/modules/ukom/models/ukom-module-refactor/import-question-request.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'

@Component({
    selector: 'app-ukom-question-import',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ReactiveFormsModule,
    ],
    templateUrl: './ukom-question-import.component.html',
    styleUrl: './ukom-question-import.component.scss',
})
export class UkomQuestionImportComponent {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    @ViewChild(FileHandlerComponent) fileHandlerComponent!: FileHandlerComponent
    examTypeCode = new FormControl('', Validators.required)
    base64FileQuestion = ''

    isLoading = false

    inputs: FIleHandler = {
        files: {
            questionFile: { label: 'File Pertanyaan' },
        },
        allowedTypes: [
            { label: 'xls', type: 'application/vnd.ms-excel' },
            {
                label: 'xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
        listen: (key: string, base64Data: string) => {
            this.base64FileQuestion = base64Data
        },
    }

    examTypeList$: Observable<ExamType[]>

    constructor(
        private ukomModulesService: UkomModulesService,
        private formValidationService: FormValidationService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.examTypeList$ = this.ukomMiscellaneousService.getExamType()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.examTypeCode,
            controlName,
            label,
        )
    }

    handleDownloadTemplate() {
        
        this.ukomModulesService
            .downloadTemplate(this.examTypeCode.value)
            .subscribe({
                error: (err) => {
                    console.error(err)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal mengunduh template pertanyaan',
                    )
                },
            })
    }

    importQuestion() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isLoading = true

                const body = new ImportQuestionRequest({
                    exam_type: this.examTypeCode.value,
                    file_question: this.base64FileQuestion,
                })

                console.log('b', body)

                this.ukomModulesService
                    .saveBulk(body)
                    .pipe(finalize(() => (this.isLoading = false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengimpor pertanyaan',
                            )
                            this.fileHandlerComponent.clearFileName()
                            this.base64FileQuestion = ''
                        },
                        error: (err) => {
                            console.error(err)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengimpor pertanyaan',
                            )
                        },
                    })
            },
        })
    }
}
