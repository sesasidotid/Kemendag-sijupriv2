import { IndikatorKompetensiUkom } from '@/modules/ukom/models/indikator-kompetensi'
import { Component, Input } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder,
} from '@/modules/base/commons/pagable/pagable-builder'
import { ApiService } from '@/modules/base/services/api.service'
import { CommonModule } from '@angular/common'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import { Router } from '@angular/router'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'

@Component({
    selector: 'app-ukom-kompetensi-detail-pagable',
    standalone: true,
    imports: [
        CommonModule,
        PagableComponent,
        ModalComponent,
        ReactiveFormsModule,
        LoadingButtonComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-kompetensi-detail-pagable.component.html',
    styleUrl: './ukom-kompetensi-detail-pagable.component.scss',
})
export class UkomKompetensiDetailPagableComponent {
    @Input() kompetensiId: string | null = null
    pagable: Pagable
    isModalOpen$ = new BehaviorSubject<boolean>(false)
    isSubmitLoading$ = new BehaviorSubject<boolean>(false)

    editIndikatorKompetensiForm = this.fb.group({
        id: ['', [Validators.required]],
        name: ['', [Validators.required, Validators.minLength(3)]],
    })
    constructor(
        private apiService: ApiService,
        private router: Router,
        private fb: FormBuilder,
        private formValidationService: FormValidationService,
        private confirmationService: ConfirmationService,
        private handlerService: HandlerService,
    ) {}

    ngOnInit() {
        this.handlePagable()
    }

    handlePagable(): void {
        this.pagable = new PagableBuilder(
            `/api/v1/kompetensi_indikator/search?like_kompetensiId=${this.kompetensiId}`,
        )
            .addPrimaryColumn(new PrimaryColumnBuilder('Kode', 'code').build())
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Indikator Kompetensi',
                    'name',
                ).build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: IndikatorKompetensiUkom) => {
                        this.router.navigate([
                            `maintenance/kompetensi-list/${data.kompetensiId}/indikator/${data.id}`,
                        ])
                    }, 'info')
                    .withIcon('detail')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: IndikatorKompetensiUkom) => {
                        this.toggleModal()
                        this.setDefaultFormValues(data)
                    }, 'primary')
                    .withIcon('update')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((data: IndikatorKompetensiUkom) => {
                        this.deleteIndikatorKompetensi(data.id)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.editIndikatorKompetensiForm.get(controlName),
            controlName,
            label,
        )
    }

    setDefaultFormValues(data: IndikatorKompetensiUkom): void {
        this.editIndikatorKompetensiForm.patchValue({
            id: data.id,
            name: data.name,
        })
    }

    toggleModal(): void {
        this.isModalOpen$.next(!this.isModalOpen$.value)
    }

    deleteIndikatorKompetensi(id: string): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.apiService
                    .deleteData(`/api/v1/kompetensi_indikator/${id}`)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus data',
                            )
                            this.handlePagable()
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
    onSubmit(): void {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.isSubmitLoading$.next(true)

                const payload = new IndikatorKompetensiUkom(
                    this.editIndikatorKompetensiForm.value,
                )

                this.apiService
                    .putData('/api/v1/kompetensi_indikator', payload)
                    .subscribe({
                        next: () => {
                            this.toggleModal()
                            this.handlePagable()
                            this.isSubmitLoading$.next(false)

                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil memperbarui data',
                            )
                        },
                        error: (err) => {
                            console.error(
                                'Error updating indikator kompetensi:',
                                err,
                            )
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal memperbarui data',
                            )

                            this.isSubmitLoading$.next(false)
                        },
                    })
            },
        })
    }
}
