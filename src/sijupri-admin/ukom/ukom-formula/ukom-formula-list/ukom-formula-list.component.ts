import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { BehaviorSubject, finalize } from 'rxjs'
import { ApiService } from '@/modules/base/services/api.service'
import { Router } from '@angular/router'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { Jenjang } from '@/modules/maintenance/models/jenjang.modle'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { HandlerService } from '@/modules/base/services/handler.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { FormulaDetail } from '@/modules/ukom/models/formula-detail'

@Component({
    selector: 'app-ukom-formula-list',
    standalone: true,
    imports: [
        CommonModule,
        PagableComponent,
        ModalComponent,
        FormsModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-formula-list.component.html',
    styleUrl: './ukom-formula-list.component.scss',
})
export class UkomFormulaListComponent implements OnInit {
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    isModalOpen$ = new BehaviorSubject<boolean>(false)

    editFormulaForm: FormGroup
    jabatanList: Jabatan[] = []
    refreshToggle: boolean = false

    isLoading$ = new BehaviorSubject<boolean>(false)

    jabatanService = inject(JabatanService)
    jenjangService = inject(JenjangService)

    constructor(
        private apiService: ApiService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.handlePagable()
        this.handleFormInit()
        this.getJabatanList()
        this.jenjangService.fetchJenjang()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.editFormulaForm.get(controlName),
            controlName,
            label,
        )
    }

    handlePagable() {
        this.pagable$.next(
            new PagableBuilder('/api/v1/ukom_formula/search')
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Jabatan', 'jabatanName')
                        .withTitle(
                            (formula: FormulaDetail) => formula.jabatanName,
                        )
                        .build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('Jenjang', 'jenjangName').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('CAT', 'catPercentage').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Wawancara',
                        'wawancaraPercentage',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Seminar',
                        'seminarPercentage',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Praktik',
                        'praktikPercentage',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Portofolio',
                        'portofolioPercentage',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Studi Kasus',
                        'studiKasusPercentage',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('UKT', 'uktPercentage').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder('UKMS', 'ukmskPercentage').build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Ambang Batas Nilai',
                        'gradeThreshold',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Ambang Batas UKT',
                        'uktThreshold',
                    ).build(),
                )
                .addPrimaryColumn(
                    new PrimaryColumnBuilder(
                        'Ambang Batas UKMSK',
                        'jpmThreshold',
                    ).build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((data: FormulaDetail) => {
                            this.setDefaultFormValues(data)
                            this.toggleModal()
                        }, 'primary')
                        .withIcon('update')
                        .build(),
                )
                .addActionColumn(
                    new ActionColumnBuilder()
                        .setAction((data: FormulaDetail) => {
                            this.router.navigate([
                                `ukom/ukom-formula/${data.id}`,
                            ])
                        }, 'info')
                        .withIcon('detail')
                        .build(),
                )
                .withQueryParams()
                .build(),
        )
    }

    updateFilterOptions() {
        const currentPagable = this.pagable$.value
        let filterList = currentPagable.filterList

        // Ensure jabatan filter
        filterList = this.ensureFilter(
            filterList,
            'eq_jabatanCode',
            'Jabatan',
            this.jabatanList,
        )

        this.jenjangService.jenjangList$.subscribe((jenjangs) => {
            const finalFilterList = this.ensureFilter(
                filterList,
                'eq_jenjangCode',
                'Jenjang',
                jenjangs,
            )

            this.pagable$.next({
                ...currentPagable,
                filterList: finalFilterList,
            })
        })
    }

    handleFormInit() {
        this.editFormulaForm = new FormGroup({
            id: new FormControl(''),
            catPercentage: new FormControl('', Validators.required),
            wawancaraPercentage: new FormControl('', Validators.required),
            seminarPercentage: new FormControl('', Validators.required),
            praktikPercentage: new FormControl('', Validators.required),
            portofolioPercentage: new FormControl('', Validators.required),
            studiKasusPercentage: new FormControl('', Validators.required),
            uktPercentage: new FormControl('', Validators.required),
            ukmskPercentage: new FormControl('', Validators.required),
            gradeThreshold: new FormControl('', Validators.required),
            uktThreshold: new FormControl('', Validators.required),
            jpmThreshold: new FormControl('', Validators.required),
        })
    }

    setDefaultFormValues(data: any) {
        this.editFormulaForm.patchValue({
            id: data.id ?? '',
            jabatanCode: data.jabatanCode ?? '',
            jenjangCode: data.jenjangCode ?? '',
            catPercentage: data.catPercentage ?? '',
            wawancaraPercentage: data.wawancaraPercentage ?? '',
            seminarPercentage: data.seminarPercentage ?? '',
            praktikPercentage: data.praktikPercentage ?? '',
            portofolioPercentage: data.portofolioPercentage ?? '',
            studiKasusPercentage: data.studiKasusPercentage ?? '',
            uktPercentage: data.uktPercentage ?? '',
            ukmskPercentage: data.ukmskPercentage ?? '',
            gradeThreshold: data.gradeThreshold ?? '',
            uktThreshold: data.uktThreshold ?? '',
            jpmThreshold: data.jpmThreshold ?? '',
        })
    }

    handleRefreshToggle() {
        this.refreshToggle = !this.refreshToggle
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    getJabatanList() {
        this.jabatanService
            .findAll()
            .pipe(
                finalize(() => {
                    this.updateFilterOptions()
                }),
            )
            .subscribe({
                next: (res) => {
                    this.jabatanList = res
                },
                error: (err) => {
                    console.error(err)
                    this.jabatanList = []
                },
            })
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: (response: { confirmed: boolean }) => {
                if (!response.confirmed) return
                this.isLoading$.next(true)

                const payload = {
                    id: this.editFormulaForm.value.id,
                    catPercentage: this.editFormulaForm.value.catPercentage,
                    wawancaraPercentage:
                        this.editFormulaForm.value.wawancaraPercentage,
                    seminarPercentage:
                        this.editFormulaForm.value.seminarPercentage,
                    praktikPercentage:
                        this.editFormulaForm.value.praktikPercentage,
                    portofolioPercentage:
                        this.editFormulaForm.value.portofolioPercentage,
                    studiKasusPercentage:
                        this.editFormulaForm.value.studiKasusPercentage,
                    uktPercentage: this.editFormulaForm.value.uktPercentage,
                    ukmskPercentage: this.editFormulaForm.value.ukmskPercentage,
                    gradeThreshold: this.editFormulaForm.value.gradeThreshold,
                    uktThreshold: this.editFormulaForm.value.uktThreshold,
                    jpmThreshold: this.editFormulaForm.value.jpmThreshold,
                }

                this.apiService
                    .putData('/api/v1/ukom_formula', payload)
                    .subscribe({
                        next: () => {
                            this.isLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            this.toggleModal()
                            this.handleRefreshToggle()
                        },
                        error: (error) => {
                            this.isLoading$.next(false)
                            console.log('error', error.error.message)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengubah data, silahkan coba lagi',
                            )
                        },
                    })
            },
        })
    }

    private ensureFilter(
        filterList: PageFilter[],
        key: string,
        label: string,
        sourceList: { code: string; name: string }[],
    ): PageFilter[] {
        const updated = filterList.map((item) =>
            item.key === key
                ? {
                      ...item,
                      optionList: sourceList.map((i) => ({
                          label: i.name,
                          value: i.code,
                      })),
                  }
                : item,
        )

        return updated.some((item) => item.key === key)
            ? updated
            : [
                  ...updated,
                  new PageFilter({
                      label,
                      fieldType: 'select',
                      key,
                      value: '',
                      optionList: sourceList.map((i) => ({
                          label: i.name,
                          value: i.code,
                      })),
                  }),
              ]
    }
}
