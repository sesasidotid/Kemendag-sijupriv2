import { Component } from '@angular/core'
import { TabService } from '../../../../modules/base/services/tab.service'
import { ApiService } from '../../../../modules/base/services/api.service'
import { AlertService } from '../../../../modules/base/services/alert.service'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { UkomKompetensiAddComponent } from '../ukom-kompetensi-add/ukom-kompetensi-add.component'
import { CommonModule } from '@angular/common'
import { Pagable } from '../../../../modules/base/commons/pagable/pagable'
import { PagableComponent } from '../../../../modules/base/components/pagable/pagable.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PageFilterBuilder,
    PrimaryColumnBuilder
} from '../../../../modules/base/commons/pagable/pagable-builder'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { ModalComponent } from '../../../../modules/base/components/modal/modal.component'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { BidangJabatan } from '../../../../modules/maintenance/models/bidang-jabatan.model'
import { KompetensiUkom } from '../../../../modules/ukom/models/kompetensi'
@Component({
    selector: 'app-ukom-kompetensi-list',
    standalone: true,
    imports: [
        PagableComponent,
        UkomKompetensiAddComponent,
        CommonModule,
        ModalComponent,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './ukom-kompetensi-list.component.html',
    styleUrl: './ukom-kompetensi-list.component.scss'
})
export class UkomKompetensiListComponent {
    tab$ = new BehaviorSubject<number | null>(0)
    pagable: Pagable
    jenjangMap: Record<string, string> = {}
    jabatanMap: Record<string, string> = {}
    bidangJabatanMap: Record<string, string> = {}
    refreshToggle: boolean = false

    isModalOpen$ = new BehaviorSubject<boolean>(false)

    editKompetensiForm: FormGroup
    loadingButton$ = new BehaviorSubject<boolean>(false)

    constructor (
        private apiService: ApiService,
        public tabService: TabService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
        private formValidationService: FormValidationService,
        private router: Router
    ) {}

    ngOnInit () {
        this.handleFormInit()
        this.handlePagable()
        this.handleTabService()
        this.getJabatanList()
        this.getJenjangList()
        this.getBidangJabatanList()
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.editKompetensiForm.get(controlName),
            controlName,
            label
        )
    }

    handleFormInit () {
        this.editKompetensiForm = new FormGroup({
            id: new FormControl(''),
            name: new FormControl('', Validators.required),
            level: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required)
        })
    }

    handlePagable () {
        this.pagable = new PagableBuilder(`/api/v1/kompetensi/search`)
            .addPrimaryColumn(new PrimaryColumnBuilder('Kode', 'code').build())
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue(
                        'Jabatan',
                        (data: KompetensiUkom) =>
                            this.jabatanMap[data.jabatanCode]
                    )
                    .build()
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder()
                    .withDynamicValue('Jenjang', (data: KompetensiUkom) => {
                        return this.jenjangMap[data.jenjangCode] || null
                    })
                    .build()
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
                        }
                    )
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('equal')
                    .setProperty('code')
                    .withField('Kode', 'text')
                    .build()
            )
            .addFilter(
                new PageFilterBuilder('like')
                    .setProperty('name')
                    .withField('Nama', 'text')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: KompetensiUkom) => {
                        this.router.navigate([
                            `maintenance/kompetensi-list/${data.id}`
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: KompetensiUkom) => {
                        this.setDefaultFormValues(data)
                        this.toggleModal()
                    }, 'primary')
                    .withIcon('update')
                    .build()
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: KompetensiUkom) => {
                        this.deleteKompetensi(data.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build()
            )
            .build()
    }

    handleTabService () {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'Kompetensi',
                icon: 'mdi-list-box',
                isActive: true,
                onClick: () => this.handleTabChange(0)
            })
            .addTab({
                label: 'Tambah Kompetensi',
                icon: 'mdi-plus-circle',
                onClick: () => this.handleTabChange(1)
            })
    }

    setDefaultFormValues (data: any) {
        this.editKompetensiForm.patchValue({
            id: data.id || '',
            level: data.level || '',
            name: data.name || '',
            description: data.description || ''
        })
    }

    getJabatanList () {
        this.apiService.getData(`/api/v1/jabatan`).subscribe({
            next: (response: any) => {
                response.forEach((j: any) => {
                    const jabatan = new Jabatan(j)
                    this.jabatanMap[jabatan.code] = jabatan.name
                })
            },
            error: err => {
                console.error('Error fetching jabatan data:', err)
            }
        })
    }

    getJenjangList () {
        this.apiService.getData('/api/v1/jenjang/').subscribe({
            next: (response: any) => {
                response.forEach((j: any) => {
                    const jenjang = new Jenjang(j)
                    this.jenjangMap[jenjang.code] = jenjang.name
                })
            },
            error: err => {
                console.error('Error fetching jenjang data:', err)
            }
        })
    }

    getBidangJabatanList () {
        this.apiService.getData('/api/v1/bidang_jabatan/').subscribe({
            next: (response: any) => {
                response.forEach((b: any) => {
                    const bidangJabatan = new BidangJabatan(b)
                    this.bidangJabatanMap[bidangJabatan.code] =
                        bidangJabatan.name
                })
            },
            error: err => {
                console.error('Error fetching bidang jabatan data:', err)
            }
        })
    }

    handleTabChange (tab?: number) {
        this.tab$.next(tab)
        this.tabService.changeTabActive(tab)
    }

    toggleModal () {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    handleRefreshToggle () {
        this.refreshToggle = !this.refreshToggle
    }

    deleteKompetensi (id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.apiService
                    .deleteData(`/api/v1/kompetensi/${id}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus data'
                            )
                            this.handleRefreshToggle()
                        },
                        error: () => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus data'
                            )
                        }
                    })
            }
        })
    }

    submit () {
        const payload = {
            id: this.editKompetensiForm.value.id,
            name: this.editKompetensiForm.value.name,
            level: this.editKompetensiForm.value.level,
            description: this.editKompetensiForm.value.description
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
                                'Berhasil mengubah data'
                            )
                            this.handleRefreshToggle()
                            this.toggleModal()
                        },
                        error: () => {
                            this.loadingButton$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengubah data'
                            )
                        }
                    })
            }
        })
    }
}
