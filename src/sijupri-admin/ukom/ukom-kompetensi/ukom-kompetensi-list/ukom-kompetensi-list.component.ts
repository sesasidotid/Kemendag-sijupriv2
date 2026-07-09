import { Component, OnInit } from '@angular/core'
import { TabService } from '@/modules/base/services/tab.service'
import { ApiService } from '@/modules/base/services/api.service'
import { Router, ActivatedRoute } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { UkomKompetensiAddComponent } from '../ukom-kompetensi-add/ukom-kompetensi-add.component'
import { CommonModule } from '@angular/common'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { Jabatan } from '@/modules/maintenance/models/jabatan.model'
import { Jenjang } from '@/modules/maintenance/models/jenjang.modle'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { BidangJabatan } from '@/modules/maintenance/models/bidang-jabatan.model'
import { KompetensiUkom } from '@/modules/ukom/models/kompetensi'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { signal } from '@angular/core'
import { PageFilter } from '@/modules/base/commons/pagable/page-filter'

@Component({
    selector: 'app-ukom-kompetensi-list',
    standalone: true,
    imports: [
        PagableComponent,
        UkomKompetensiAddComponent,
        CommonModule,
        ModalComponent,
        FormsModule,
        ReactiveFormsModule,
        InvalidOnTouchDirective,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-kompetensi-list.component.html',
    styleUrl: './ukom-kompetensi-list.component.scss',
})
export class UkomKompetensiListComponent implements OnInit {
    tab$ = new BehaviorSubject<number | null>(0)
    pagable$ = new BehaviorSubject<Pagable | null>(null)
    jenjangMap: Record<string, string> = {}
    jabatanMap: Record<string, string> = {}
    bidangJabatanMap: Record<string, string> = {}
    refreshToggle: boolean = false

    jabatanList = signal<Jabatan[]>([])
    jenjangList = signal<Jenjang[]>([])
    bidangJabatanList = signal<BidangJabatan[]>([])
    selectedJabatanCode = signal<string>('')

    isModalOpen$ = new BehaviorSubject<boolean>(false)

    editKompetensiForm: FormGroup
    loadingButton$ = new BehaviorSubject<boolean>(false)

    constructor(
        private apiService: ApiService,
        public tabService: TabService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private formValidationService: FormValidationService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit() {
        this.syncFiltersWithUrl();
        this.handleFormInit()
        this.handlePagable()
        this.handleTabService()
        this.getJabatanList()
        this.getJenjangList()
        this.getBidangJabatanList()
    }

    syncFiltersWithUrl() {
        const queryParams = this.route.snapshot.queryParams;
        if (queryParams['eq_jabatanCode']) {
            this.selectedJabatanCode.set(queryParams['eq_jabatanCode']);
        }
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.editKompetensiForm.get(controlName),
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.editKompetensiForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            level: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
        })
    }

    handlePagable() {
        const pagable = new PagableBuilder(`/api/v1/kompetensi/search`)
            .addPrimaryColumn(new PrimaryColumnBuilder('Kode', 'code').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Nama', 'name')
                    .withTitle((data) => data.name)
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Jabatan',
                        (data: KompetensiUkom) =>
                            this.jabatanMap[data.jabatanCode],
                    )
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenjang', (data: KompetensiUkom) => {
                        return this.jenjangMap[data.jenjangCode] || null
                    })
                    .build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Bidang Jabatan',
                        (data: KompetensiUkom) => {
                            return (
                                this.bidangJabatanMap[data.bidangJabatanCode] ||
                                null
                            )
                        },
                    )
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('code')
                    .withField('Kode', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name')
                    .withField('Nama', 'text')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('jabatanCode')
                    .withField('Jabatan', 'select')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('jenjangCode')
                    .withField('Jenjang', 'select')
                    .build(),
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('bidangJabatanCode')
                    .withField('Bidang Jabatan', 'select')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: KompetensiUkom) => {
                        this.router.navigate([
                            `maintenance/kompetensi-list/${data.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: KompetensiUkom) => {
                        this.setDefaultFormValues(data)
                        this.toggleModal()
                    }, 'primary')
                    .withIcon('update')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: KompetensiUkom) => {
                        this.deleteKompetensi(data.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .withQueryParams()
            .build()

        this.pagable$.next(pagable)
    }

    updateFilterOptions() {
        if (!this.pagable$.value) return;
        const currentPagable = this.pagable$.value
        let filterList = currentPagable.filterList

        filterList = this.ensureFilter(
            filterList,
            'eq_jabatanCode',
            'Jabatan',
            this.jabatanList(),
            (val) => {
                this.selectedJabatanCode.set(val as string);
                this.updateFilterOptions();
            }
        )

        filterList = this.ensureFilter(
            filterList,
            'eq_jenjangCode',
            'Jenjang',
            this.jenjangList(),
            undefined
        )

        // Only show bidang jabatan filter if the selected jabatan has bidang jabatans or is selected
        const filteredBidang = this.bidangJabatanList().filter(b => b.jabatanCode === this.selectedJabatanCode());

        // Keep it visible if there is a selected jabatan, even if API is still pending
        if (this.selectedJabatanCode()) {
            filterList = this.ensureFilter(
                filterList,
                'eq_bidangJabatanCode',
                'Bidang Jabatan',
                filteredBidang,
                undefined
            )
        } else {
            filterList = filterList.filter(f => f.key !== 'eq_bidangJabatanCode')
        }

        this.pagable$.next({
            ...currentPagable,
            filterList: filterList,
        })
    }

    private ensureFilter(
        filterList: PageFilter[],
        key: string,
        label: string,
        sourceList: any[],
        onChange?: (value: string | number | boolean) => void
    ): PageFilter[] {
        const urlValue = this.route.snapshot.queryParams[key] || '';

        const updated = filterList.map((item) => {
            if (item.key === key) {
                item.optionList = sourceList.map((i) => ({
                    label: i.name,
                    value: i.code,
                }));
                item.value = item.value || urlValue;
                if (onChange) {
                    item.onChange = onChange;
                }
                return item;
            }
            return item;
        });

        return updated.some((item) => item.key === key)
            ? updated
            : [
                  ...updated,
                  new PageFilter({
                      label,
                      fieldType: 'select',
                      key,
                      value: urlValue,
                      optionList: sourceList.map((i) => ({
                          label: i.name,
                          value: i.code,
                      })),
                      onChange: onChange
                  }),
              ]
    }

    handleTabService() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Kompetensi',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => this.handleTabChange(0),
            })
            .addTab({
                label: 'Tambah Kompetensi',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1),
            })
    }

    setDefaultFormValues(data: any) {
        this.editKompetensiForm.patchValue({
            id: data.id || '',
            level: data.level || '',
            name: data.name || '',
            description: data.description || '',
        })
    }

    getJabatanList() {
        this.apiService.getData(`/api/v1/jabatan`).subscribe({
            next: (response: any) => {
                const arr: Jabatan[] = [];
                response.forEach((j: any) => {
                    const jabatan = new Jabatan(j)
                    this.jabatanMap[jabatan.code] = jabatan.name
                    arr.push(jabatan);
                })
                this.jabatanList.set(arr);
            },
            error: (err) => {
                console.error('Error fetching jabatan data:', err)
            },
            complete: () => {
                this.updateFilterOptions()
            }
        })
    }

    getJenjangList() {
        this.apiService.getData('/api/v1/jenjang').subscribe({
            next: (response: any) => {
                const arr: Jenjang[] = [];
                response.forEach((j: any) => {
                    const jenjang = new Jenjang(j)
                    this.jenjangMap[jenjang.code] = jenjang.name
                    arr.push(jenjang);
                })
                this.jenjangList.set(arr);
            },
            error: (err) => {
                console.error('Error fetching jenjang data:', err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data jenjang',
                )
            },
            complete: () => {
                this.updateFilterOptions()
            }
        })
    }

    getBidangJabatanList() {
        this.apiService.getData('/api/v1/bidang_jabatan').subscribe({
            next: (response: any) => {
                const arr: BidangJabatan[] = [];
                response.forEach((b: any) => {
                    const bidangJabatan = new BidangJabatan(b)
                    this.bidangJabatanMap[bidangJabatan.code] =
                        bidangJabatan.name
                    arr.push(bidangJabatan);
                })
                this.bidangJabatanList.set(arr);
            },
            error: (err) => {
                console.error('Error fetching bidang jabatan data:', err)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data bidang jabatan',
                )
            },
            complete: () => {
                this.updateFilterOptions()
            }
        })
    }

    handleTabChange(tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    toggleModal() {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    handleRefreshToggle() {
        this.refreshToggle = !this.refreshToggle
    }

    deleteKompetensi(id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.apiService
                    .deleteData(`/api/v1/kompetensi/${id}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus data',
                            )
                            this.handleRefreshToggle()
                        },
                        error: () => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus data',
                            )
                        },
                    })
            },
        })
    }

    submit() {
        const payload = {
            id: this.editKompetensiForm.value.id,
            name: this.editKompetensiForm.value.name,
            level: this.editKompetensiForm.value.level,
            description: this.editKompetensiForm.value.description,
        }

        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.loadingButton$.next(true)

                this.apiService
                    .putData('/api/v1/kompetensi', payload)
                    .subscribe({
                        next: () => {
                            this.loadingButton$.next(false)
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil mengubah data',
                            )
                            this.handleRefreshToggle()
                            this.toggleModal()
                        },
                        error: () => {
                            this.loadingButton$.next(false)
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
