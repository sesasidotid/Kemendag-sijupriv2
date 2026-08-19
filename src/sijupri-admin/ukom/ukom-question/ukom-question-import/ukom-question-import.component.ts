import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { UkomModulesService } from '@/modules/ukom/services/ukom-modules.service'
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core'
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
import {
    ImportQuestionListUpload,
    ImportQuestionRequest,
} from '@/modules/ukom/models/ukom-module-refactor/import-question-request.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { TabService } from '@/modules/base/services/tab.service'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { take } from 'rxjs/operators'
import { UkomQuestion } from '@/modules/ukom/models/ukom-question'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { ApiService } from '@/modules/base/services/api.service'
import { UploadStudyCaseFileComponent } from '@/sijupri-admin/ukom/ukom-question/ukom-question-import/upload-study-case-file/upload-study-case-file.component'
import { toSignal } from '@angular/core/rxjs-interop'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'

@Component({
    selector: 'app-ukom-question-import',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ReactiveFormsModule,
        InvalidOnTouchDirective,
        UploadStudyCaseFileComponent,
        PagableComponent,
    ],
    templateUrl: './ukom-question-import.component.html',
    styleUrl: './ukom-question-import.component.scss',
})
export class UkomQuestionImportComponent implements OnInit {
    tabService = inject(TabService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    @ViewChild('templateHandler') templateHandler!: FileHandlerComponent

    examTypeCode = new FormControl('', Validators.required)

    examTypeList$: Observable<ExamType[]>
    isLoading = false

    // collected files
    templateFileBase64 = ''
    studiKasusUploadedList: ImportQuestionListUpload[] = []
    isStudiKasusUploaded = false

    activeTab = toSignal(this.tabService.activeTab$, { initialValue: 0 })

    pagable = signal<Pagable>(null)

    refresh = signal(false)
    resetUploadComponent = signal(0)

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

    apiService = inject(ApiService)
    protected readonly ExamTypeCategory = ExamTypeCategory

    constructor(
        private ukomModulesService: UkomModulesService,
        private formValidationService: FormValidationService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.examTypeList$ = this.ukomMiscellaneousService.getExamType()
        this.initTab()
        this.initPagable()

        this.examTypeCode.valueChanges.subscribe((value) => {
            if (value !== ExamTypeCategory.STUDI_KASUS) {
                this.studiKasusUploadedList = []
                this.isStudiKasusUploaded = false
            }
        })

        this.examTypeList$.pipe(take(1)).subscribe((examTypes) => {
            if (examTypes?.length) {
                this.updatePagableFilterOptions(examTypes)
            }
        })
    }

    initTab() {
        this.tabService.clearTabs()

        this.tabService
            .addTab({
                label: 'Daftar Pertanyaan',
                isActive: true,
                onClick: () => {
                    this.tabService.changeTabActive(0)
                },
                icon: 'mdi-list-box',
            })
            .addTab({
                label: 'Impor Pertanyaan',
                onClick: () => {
                    this.tabService.changeTabActive(1)
                },
                icon: 'mdi-file-import',
            })
    }

    initPagable() {
        this.pagable.set(
            new PagableBuilder('/api/v1/question/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue('Asal Soal', (data: UkomQuestion) => {
                            if (data.id.startsWith('base_')) return 'Sistem'
                            return 'Admin Impor'
                        })
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Pertanyaan', 'question')
                        .withTitle((data: UkomQuestion) => data.question)
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder()
                        .withDynamicValue(
                            'Module Ukom',
                            (data: ExamQuestion) => {
                                return this.ukomMiscellaneousService.getModuleDisplayName(
                                    data.moduleId,
                                )
                            },
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Tipe Soal', 'type').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Indikator Kompetensi', 'association').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Bobot', 'weight').build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('question')
                        .withField('Pertanyaan', 'text')
                        .build(),
                )
                .addFilter(
                    new PageFilterBuilder('equal')
                        .setProperty('moduleId')
                        .withField('Module', 'select')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((data: ExamQuestion) => {
                            this.deleteQuestion(data.id)
                        }, 'danger')
                        .withIcon('danger')
                        .addInactiveCondition((data: ExamQuestion) => {
                            if (data.id.startsWith('base_')) return true
                            return false
                        })
                        .build(),
                )
                .withQueryParams()
                .build(),
        )
    }

    deleteQuestion(question_id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.apiService
                    .deleteData(`/api/v1/question/${question_id}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus pertanyaan',
                            )
                            this.refresh.set(!this.refresh())
                        },
                        error: (error: any) => {
                            console.error('Error deleting question:', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus pertanyaan',
                            )
                        },
                    })
            },
        })
    }

    updatePagableFilterOptions(examTypes: ExamType[]) {
        const currentPagable = this.pagable()

        currentPagable.filterList.forEach((item) => {
            if (item.key === 'eq_moduleId') {
                item.optionList = examTypes.map((exam) => ({
                    label: this.ukomMiscellaneousService.getModuleDisplayName(
                        exam.name,
                    ),
                    value: exam.code,
                }))
            }
        })

        // Clone the Pagable instance to trigger a signal update while preserving methods
        const updatedPagable = Object.assign(
            Object.create(Object.getPrototypeOf(currentPagable)),
            currentPagable
        )
        this.pagable.set(updatedPagable)
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
                    body.uploadSoalList = this.studiKasusUploadedList
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
                            this.templateFileBase64 = ''
                            this.studiKasusUploadedList = []
                            this.isStudiKasusUploaded = false

                            // trigger a reset to the study case component
                            this.resetUploadComponent.update(v => v + 1)
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
            (!this.isStudiKasusUploaded ||
                this.studiKasusUploadedList.length === 0)
        ) {
            return true
        }

        return false
    }

    handleListUploadChange(list: ImportQuestionListUpload[]) {
        this.studiKasusUploadedList = list
        console.log('Studi kasus file emit', list)
    }

    handleAllFileUploadedChange(uploaded: boolean) {
        this.isStudiKasusUploaded = uploaded
        console.log('Studi kasus file emit', uploaded)
    }
}
