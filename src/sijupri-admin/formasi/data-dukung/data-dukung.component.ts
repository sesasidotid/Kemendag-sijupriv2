import { Component, inject, signal } from '@angular/core'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import {
    FormasiDataDukungCreateModel,
    FormasiDataDukungModel,
} from '@/modules/formasi/models_v2/formasi-data-dukung.model'
import { FormasiDataDukungService } from '@/modules/formasi/services/formasi-data-dukung.service'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { TabService } from '@/modules/base/services/tab.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { Router } from '@angular/router'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { CommonModule } from '@angular/common'
import { toSignal } from '@angular/core/rxjs-interop'
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { finalize } from 'rxjs'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { HandlerService } from '@/modules/base/services/handler.service'

@Component({
    selector: 'app-data-dukung',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './data-dukung.component.html',
    styleUrl: './data-dukung.component.scss',
})
export class DataDukungComponent {
    tabService = inject(TabService)
    confirmationService = inject(ConfirmationService)
    dataDukungService = inject(FormasiDataDukungService)
    router = inject(Router)
    fb = inject(FormBuilder)
    formValidationService = inject(FormValidationService)
    pagable = signal<Pagable>(null)
    refreshSignal = signal(false)

    activeTab = toSignal(this.tabService.activeTab$, { initialValue: 0 })

    submitLoading = signal(false)

    dataDukungForm: FormGroup
    handlerService = inject(HandlerService)

    constructor() {}

    ngOnInit() {
        this.initTabs()
        this.initPagable()
        this.initForm()
    }

    initForm() {
        this.dataDukungForm = this.fb.group({
            name: ['', [Validators.required]],
        })
    }

    initTabs() {
        this.tabService.clearTabs()

        this.tabService
            .addTab({
                isActive: true,
                label: 'Daftar Data Dukung Formasi',
                onClick: () => {
                    this.tabService.changeTabActive(0)
                },
                icon: 'mdi-list-box',
            })
            .addTab({
                label: 'Tambah Data Dukung Formasi',
                onClick: () => {
                    this.tabService.changeTabActive(1)
                },
                icon: 'mdi-plus-circle',
            })
    }

    initPagable() {
        const pageable = new PagableBuilder(
            '/api/v1/doc_persyaratan/association/for_formasi',
        )
            .addPrimaryColumn(new PrimaryColumnBuilder('Nama', 'name').build())
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((item: FormasiDataDukungModel) => {
                        this.handleDeleteDataDukung(item.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()

        this.pagable.set(pageable)
    }

    handleDeleteDataDukung(id: string) {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.dataDukungService.deleteDataDukung(id).subscribe({
                    next: () => {
                        this.handlerService.handleAlert(
                            'Success',
                            'Data berhasil dihapus',
                        )
                        this.refreshSignal.set(!this.refreshSignal())
                    },
                })
            },
        })
    }

    submitCreateDataDukung() {
        if (this.dataDukungForm.invalid) return

        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitLoading.set(true)

                const payload = new FormasiDataDukungCreateModel({
                    name: this.dataDukungForm.get('name').value,
                    association: 'for_formasi',
                })

                this.dataDukungService
                    .createDataDukungForFormasi(payload)
                    .pipe(finalize(() => this.submitLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            this.dataDukungForm.reset()
                            this.refreshSignal.set(!this.refreshSignal())
                        },
                    })
            },
        })
    }

    isFieldInvalid(name: string): boolean {
        const control = this.dataDukungForm.get(name)
        return !!(control && control.invalid && control.touched)
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.dataDukungForm.get(controlName),
            controlName,
            label,
        )
    }
}
