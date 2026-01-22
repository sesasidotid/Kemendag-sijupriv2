import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { UkomModulesService } from '@/modules/ukom/services/ukom-modules.service'
import { Component, inject, ViewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import {
    ExamType,
    ExamTypeCategory,
} from '@/modules/ukom/models/exam-type.model'
import { finalize, Observable } from 'rxjs'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ImportQuestionRequest } from '@/modules/ukom/models/ukom-module-refactor/import-question-request.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'

@Component({
    selector: 'app-ukom-question-import',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ReactiveFormsModule,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-question-import.component.html',
    styleUrl: './ukom-question-import.component.scss',
})
export class UkomQuestionImportComponent {
    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    @ViewChild('templateHandler') templateHandler!: FileHandlerComponent
    @ViewChild('studiKasusHandler') studiKasusHandler!: FileHandlerComponent

    examTypeCode = new FormControl('', Validators.required)

    examTypeList$: Observable<ExamType[]>
    isLoading = false

    // collected files
    templateFileBase64 = ''
    studiKasusFileBase64 = ''

    /** TEMPLATE (EXCEL) */
    templateInputs: FIleHandler = {
        files: {
            file_question: {
                label: 'File Pertanyaan',
                required: true,
            },
        },
        allowedTypes: [
            { label: 'xls', type: 'application/vnd.ms-excel' },
            {
                label: 'xlsx',
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        ],
        listen: (_key: string, source: string) => {
            this.templateFileBase64 = source
        },
    }

    /** STUDI KASUS (PDF) */
    studiKasusInputs: FIleHandler = {
        files: {
            upload_soal: {
                label: 'File Studi Kasus',
                required: true,
            },
        },
        allowedTypes: [{ label: 'pdf', type: 'application/pdf' }],
        listen: (_key: string, source: string) => {
            this.studiKasusFileBase64 = source
            console.log('update')
        },
    }
    protected readonly ExamTypeCategory = ExamTypeCategory

    constructor(
        private ukomModulesService: UkomModulesService,
        private formValidationService: FormValidationService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.examTypeList$ = this.ukomMiscellaneousService.getExamType()

        this.examTypeCode.valueChanges.subscribe((value) => {
            if (value !== ExamTypeCategory.STUDI_KASUS) {
                this.studiKasusFileBase64 = ''
                this.studiKasusHandler?.clearFileName()
            }
        })
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
                error: () => {
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

                const body: any = {
                    examType: this.examTypeCode.value,
                    fileQuestion: this.templateFileBase64,
                }

                if (this.examTypeCode.value === ExamTypeCategory.STUDI_KASUS) {
                    body.uploadSoal = this.studiKasusFileBase64
                }

                this.ukomModulesService
                    .saveBulk(new ImportQuestionRequest(body))
                    .pipe(finalize(() => (this.isLoading = false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengimpor pertanyaan',
                            )
                            this.templateHandler.clearFileName()
                            this.studiKasusHandler?.clearFileName()
                            this.templateFileBase64 = ''
                            this.studiKasusFileBase64 = ''
                        },
                        error: () => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengimpor pertanyaan',
                            )
                        },
                    })
            },
        })
    }

    isSubmitDisabled(): boolean {
        if (this.examTypeCode.invalid || !this.templateFileBase64) {
            return true
        }

        if (
            this.examTypeCode.value === ExamTypeCategory.STUDI_KASUS &&
            !this.studiKasusFileBase64
        ) {
            return true
        }

        return false
    }
}
