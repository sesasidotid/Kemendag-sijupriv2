import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { CommonModule } from '@angular/common'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { UkomModulesService } from '@/modules/ukom/services/ukom-modules.service'
import { Component, inject, signal, ViewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ExamType, ExamTypeCategory } from '@/modules/ukom/models/exam-type.model'
import { finalize, Observable } from 'rxjs'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ImportQuestionRequest } from '@/modules/ukom/models/ukom-module-refactor/import-question-request.model'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { TabService } from '@/modules/base/services/tab.service'
import { toSignal } from '@angular/core/rxjs-interop'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '@/modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'
import { take } from 'rxjs/operators'
import { UkomQuestion } from '@/modules/ukom/models/ukom-question'
import { ExamQuestion } from '@/modules/ukom/models/exam/exam-question.model'
import { ApiService } from '@/modules/base/services/api.service'

@Component({
    selector: 'app-ukom-question-import',
    standalone: true,
    imports: [
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ReactiveFormsModule,
        InvalidOnTouchDirective,
        PagableComponent,
    ],
    templateUrl: './ukom-question-import.component.html',
    styleUrl: './ukom-question-import.component.scss',
})
export class UkomQuestionImportComponent {
    tabService = inject(TabService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)

    @ViewChild('templateHandler') templateHandler!: FileHandlerComponent
    @ViewChild('studiKasusHandler') studiKasusHandler!: FileHandlerComponent

    examTypeCode = new FormControl('', Validators.required)

    examTypeList$: Observable<ExamType[]>
    isLoading = false

    // collected files
    templateFileBase64 = ''
    studiKasusFileBase64 = ''

    activeTab = toSignal(this.tabService.activeTab$, { initialValue: 0 })

    pagable = signal<Pagable>(null)

    refresh = signal(false)

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
                this.studiKasusFileBase64 = ''
                this.studiKasusHandler?.clearFileName()
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
                    new PrimaryColumnBuilder('Pertanyaan', 'question').withTitle((data:UkomQuestion)=>(
                        data.question
                    )).build(),
                )
                // .addPrimaryColumn(
                //     new PrimaryColumnBuilder('Modul Ukom', 'moduleId').build(),
                // )
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
                    new PrimaryColumnBuilder('Bobot', 'weight').build(),
                )
                .addFilter(
                    new PageFilterBuilder('like')
                        .setProperty('question')
                        .withField('Pertanyaan', 'text')
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

        const existingFilterList = currentPagable.filterList.map((item) =>
            item.key === 'eq_moduleId'
                ? {
                      ...item,
                      optionList: examTypes.map((exam) => ({
                          label: this.ukomMiscellaneousService.getModuleDisplayName(
                              exam.name,
                          ),
                          value: exam.code,
                      })),
                  }
                : item,
        )

        const filterList = existingFilterList.some(
            (item) => item.key === 'eq_moduleId',
        )
            ? existingFilterList
            : [
                  ...existingFilterList,
                  new PageFilter({
                      label: 'Module',
                      fieldType: 'select',
                      key: 'eq_moduleId',
                      value: '',
                      optionList: examTypes.map((exam) => ({
                          label: this.ukomMiscellaneousService.getModuleDisplayName(
                              exam.name,
                          ),
                          value: exam.code,
                      })),
                  }),
              ]

        this.pagable.set({ ...currentPagable, filterList })
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
