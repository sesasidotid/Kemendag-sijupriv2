import { Component, inject, OnInit, signal } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { BehaviorSubject, finalize, map } from 'rxjs'
import { TabService } from '../../../../modules/base/services/tab.service'
import { Router } from '@angular/router'
import { UkomExaminerAddComponent } from '../ukom-examiner-add/ukom-examiner-add.component'
import { ApiService } from '../../../../modules/base/services/api.service'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { ExaminerUkom } from '@/modules/ukom/models/examiner.model'
import { MultiSelectComponent } from '@/modules/base/components/multi-select/multi-select.component'
import { UkomMiscellaneousService } from '@/modules/ukom/services/ukom-miscellaneous.service'
import { ExamType } from '@/modules/ukom/models/exam-type.model'
import { UkomExaminerService } from '@/modules/ukom/services/ukom-examiner.service'

@Component({
    selector: 'app-ukom-examiner-list',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        UkomExaminerAddComponent,
        ModalComponent,
        FormsModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        InvalidOnTouchDirective,
        MultiSelectComponent,
    ],
    templateUrl: './ukom-examiner-list.component.html',
    styleUrl: './ukom-examiner-list.component.scss',
})
export class UkomExaminerListComponent implements OnInit {
    ukomExaminerService = inject(UkomExaminerService)
    formValidationService = inject(FormValidationService)
    ukomMiscellaneousService = inject(UkomMiscellaneousService)
    pagable: Pagable
    refreshToggle: boolean = false

    isModalOpen$ = new BehaviorSubject<boolean>(false)
    editExaminerForm: FormGroup
    isLoading$ = new BehaviorSubject<boolean>(false)

    examTypeListOptions = signal<{ id: string; label: string }[]>([])

    constructor(
        public tabService: TabService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private apiService: ApiService,
    ) {}

    ngOnInit() {
        this.handleTabService()
        this.handleFormInit()
        this.handlePagable()
        this.fetchExamTypeList()
    }

    fetchExamTypeList() {
        this.ukomMiscellaneousService
            .getExamType()
            .pipe(
                map((examType) => {
                    const filtered = examType.filter(
                        (u) => !['MAKALA', 'CAT'].includes(u.code),
                    )
                    const hasSeminar = filtered.some(
                        (u) => u.code === 'SEMINAR',
                    )

                    if (!hasSeminar) {
                        filtered.push(new ExamType({ code: 'SEMINAR' }))
                    }

                    return filtered.map((u) => ({
                        id: u.code,
                        label: this.ukomMiscellaneousService.getModuleDisplayName(
                            u.code,
                        ),
                    }))
                }),
            )
            .subscribe({
                next: (response) => {
                    this.examTypeListOptions.set(response)
                },
            })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.editExaminerForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Daftar Penguji',
                isActive: true,
                icon: 'mdi-list-box',
                onClick: () => this.handleTabChange(0),
            })
            .addTab({
                label: 'Tambah Penguji',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1),
            })
    }

    handlePagable() {
        this.pagable = new PagableBuilder('/api/v1/examiner_ukom/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'name', ['user']).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Username', 'nip').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis Kelamin', (data: ExaminerUkom) =>
                        data.jenisKelaminCode === 'M'
                            ? 'Pria'
                            : data.jenisKelaminCode === 'F'
                              ? 'Wanita'
                              : data.jenisKelaminCode,
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenis UKom', (data: ExaminerUkom) =>
                        this.getJenisUkomDisplay(data),
                    )
                    .withTitle((data: ExaminerUkom) =>
                        this.getJenisUkomDisplay(data),
                    )
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: ExaminerUkom) => {
                        this.setDefaultFormValues(data)
                        this.toggleModal()
                    }, 'primary')
                    .withIcon('update')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: ExaminerUkom) => {
                        this.delete(data)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name', ['user'])
                    .withField('Nama', 'text')
                    .build(),
            )
            .withQueryParams()
            .build()
    }

    handleFormInit() {
        this.editExaminerForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            nip: new FormControl('', Validators.required),
            jenisKelaminCode: new FormControl('', Validators.required),
            examTypeList: new FormControl([], Validators.required),
        })
    }

    setDefaultFormValues(data: ExaminerUkom) {
        this.editExaminerForm.patchValue({
            id: data.id || '',
            name: data.user.name || '',
            nip: data.nip || '',
            jenisKelaminCode: data.jenisKelaminCode || '',
            examTypeList:
                data.examinerTypeList?.map(
                    (et: any) => et.examType?.code || et.examType,
                ) || [],
        })
    }

    handleTabChange(tab?: number) {
        this.tabService.changeTabActive(tab)
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    handleRefreshToggle() {
        this.refreshToggle = !this.refreshToggle
    }

    submit() {
        const payload = {
            id: this.editExaminerForm.value.id,
            name: this.editExaminerForm.value.name,
            nip: this.editExaminerForm.value.nip,
            jenisKelaminCode: this.editExaminerForm.value.jenisKelaminCode,
            examTypeList: this.editExaminerForm.value.examTypeList,
        }

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.isLoading$.next(true)
                this.apiService
                    .putData('/api/v1/examiner_ukom', payload)
                    .pipe(
                        finalize(() => {
                            this.isLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: (response) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengupdate data',
                            )
                            this.handleRefreshToggle()
                            this.toggleModal()
                        },
                        error: (error) => {
                            console.log(error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengupdate data',
                            )
                        },
                    })
            },
        })
    }

    delete(examiner: ExaminerUkom) {
        this.confirmationService.open(false).subscribe({
            next: (response) => {
                if (!response.confirmed) return

                this.ukomExaminerService
                    .deleteExaminerByUsername(examiner.nip)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus penguji',
                            )
                            this.handleRefreshToggle()
                        },
                        error: (error) => {
                            console.log(error)
                            this.handlerService.handleException(error)
                        },
                    })
            },
        })
    }

    private getJenisUkomDisplay(data: ExaminerUkom): string {
        const jenisUkomList = data.examinerTypeList
            ?.flat()
            ?.map((item) =>
                this.ukomMiscellaneousService.getModuleDisplayName(
                    item.examType,
                ),
            )
            ?.filter(Boolean)
            ?.join(', ')

        return jenisUkomList || '-'
    }
}
