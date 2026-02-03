import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { EmptyStateComponent } from '@/modules/base/components/empty-state/empty-state.component'
import { CommonModule } from '@angular/common'
import { FormasiDataDukungService } from '@/modules/formasi/services/formasi-data-dukung.service'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { finalize } from 'rxjs'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import {
    FormArray,
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { FormasiService } from "@/modules/formasi/services/formasi.service"

@Component({
    selector: 'app-upload-data-dukung',
    standalone: true,
    imports: [
        EmptyStateComponent,
        CommonModule,
        FileHandlerComponent,
        LoadingButtonComponent,
        ReactiveFormsModule,
        FormsModule,
    ],
    templateUrl: './upload-data-dukung.component.html',
    styleUrl: './upload-data-dukung.component.scss',
})
export class UploadDataDukungComponent implements OnInit {
    persyaratanDataDukungLoading = signal(false)
    pageLoading = computed(() => this.persyaratanDataDukungLoading())
    dataDukungService = inject(FormasiDataDukungService)
    fb = inject(FormBuilder)
    confirmationService = inject(ConfirmationService)
    apiService = inject(ApiService)
    handlerService = inject(HandlerService)
    isFormOpen = signal(false)
    submitLoading = signal(false)

  formasiService = inject(FormasiService)

    persyaratanList: any[] = []

    formGroup: FormGroup

    inputs: FIleHandler = {
        files: {},
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],

        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
            id: string,
        ) => {
            // Update form control when file is uploaded
            const control = this.getControlByPersyaratanId(id)
            if (control) {
                control.patchValue({
                    dokumenFile: base64Data,
                    dokumenPersyaratanName: label,
                    dokumenPersyaratanId: id,
                })
            }
        },
    }

    get formasiDokumenList(): FormArray {
        return this.formGroup.get('formasiDokumenList') as FormArray
    }

    ngOnInit() {
        this.initForm()
        this.getPersyaratanDataDukung()
    }

    initForm() {
        this.formGroup = this.fb.group({
            formasiDokumenList: this.fb.array([]),
        })
    }

    openFormPendaftaran() {
        this.isFormOpen.set(true)
    }

    getPersyaratanDataDukung() {
        this.persyaratanDataDukungLoading.set(true)
        this.dataDukungService
            .fetchPersyaratanDataDukung()
            .pipe(finalize(() => this.persyaratanDataDukungLoading.set(false)))
            .subscribe({
                next: (res) => {
                    this.persyaratanList = res

                    // Clear existing form array
                    this.formasiDokumenList.clear()

                    res.forEach((doc) => {
                        const key = doc.dokumenPersyaratanId
                        this.inputs.files[key] = {
                            label: doc.dokumenPersyaratanName,
                            id: doc.dokumenPersyaratanId,
                        }

                        // Add a FormGroup for each document requirement
                        this.formasiDokumenList.push(
                            this.fb.group({
                                dokumenFile: ['', Validators.required],
                                dokumenPersyaratanName: [''],
                                dokumenPersyaratanId: [
                                    doc.dokumenPersyaratanId,
                                ],
                            }),
                        )
                    })
                },
            })
    }

    getControlByPersyaratanId(id: string): FormGroup | null {
        const index = this.formasiDokumenList.controls.findIndex(
            (control) => control.get('dokumenPersyaratanId')?.value === id,
        )
        return index !== -1
            ? (this.formasiDokumenList.at(index) as FormGroup)
            : null
    }

    submit() {
        // Check if form is valid
        if (this.formGroup.invalid) {
            this.handlerService.handleAlert(
                'Warning',
                'Harap lengkapi semua dokumen yang diperlukan',
            )
            // Mark all fields as touched to show validation errors
            Object.keys(this.formGroup.controls).forEach((key) => {
                const control = this.formGroup.get(key)
                control?.markAsTouched()
            })
            this.formasiDokumenList.controls.forEach((control) => {
                control.markAllAsTouched()
            })
            return
        }

        // Build payload from form values
        const payload = {
            formasiDokumenList: this.formasiDokumenList.value,
        }

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) return

                this.submitLoading.set(true)

                // TODO: Replace with your actual API endpoint
                this.apiService
                    .postData('/api/v1/formasi/task', payload)
                    .pipe(finalize(() => this.submitLoading.set(false)))
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data Berhasil Disimpan',
                            )
                        },
                        error: (error) => {
                            console.error(error)
                        },
                    })
            },
        })
    }
}
