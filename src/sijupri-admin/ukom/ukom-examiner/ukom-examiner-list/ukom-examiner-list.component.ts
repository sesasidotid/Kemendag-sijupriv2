import { Component, inject } from '@angular/core'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { BehaviorSubject } from 'rxjs'
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
    ],
    templateUrl: './ukom-examiner-list.component.html',
    styleUrl: './ukom-examiner-list.component.scss',
})
export class UkomExaminerListComponent {
    formValidationService = inject(FormValidationService)
    pagable: Pagable
    refreshToggle: boolean = false

    isModalOpen$ = new BehaviorSubject<boolean>(false)
    editExaminerForm: FormGroup
    isLoading$ = new BehaviorSubject<boolean>(false)

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
                    .withDynamicValue('Jenis Kelamin', (data: any) =>
                        data.jenisKelaminCode === 'M'
                            ? 'Pria'
                            : data.jenisKelaminCode === 'F'
                              ? 'Wanita'
                              : data.jenisKelaminCode,
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'status', ['user']).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: any) => {
                        this.setDefaultFormValues(data)
                        this.toggleModal()
                    }, 'primary')
                    .withIcon('update')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name', ['user'])
                    .withField('Nama', 'text')
                    .build(),
            )
            .build()
    }

    handleFormInit() {
        this.editExaminerForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            nip: new FormControl('', Validators.required),
            jenisKelaminCode: new FormControl('', Validators.required),
        })
    }

    setDefaultFormValues(data: any) {
        this.editExaminerForm.patchValue({
            id: data.id || '',
            name: data.user.name || '',
            nip: data.nip || '',
            jenisKelaminCode: data.jenisKelaminCode || '',
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
        }

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.isLoading$.next(true)
                this.apiService
                    .putData('/api/v1/examiner_ukom', payload)
                    .subscribe({
                        next: (response) => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menambahkan data',
                            )
                            this.handleRefreshToggle()
                            this.toggleModal()
                            this.isLoading$.next(false)
                            // setTimeout(() => {
                            //   window.location.reload()
                            // }, 1000)
                        },
                        error: (error) => {
                            console.log('error', error)
                            this.isLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengubah data',
                            )
                        },
                    })
            },
        })
    }
}
