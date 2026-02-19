import { Component, inject, OnInit, signal } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { CommonModule } from '@angular/common'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { HandlerService } from '@/modules/base/services/handler.service'
import { finalize } from 'rxjs'
import { SuratRekomService } from '@/modules/ukom/services/surat-rekom.service'
import { CreatePreviewSuratRekomRequest } from '@/modules/ukom/models/surat-rekom/create-preview-surat-rekom-request.model'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Component({
    selector: 'app-ukom-grade-surat-rekom-setup',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        InvalidOnTouchDirective,
        CommonModule,
        LoadingButtonComponent,
        ModalComponent,
    ],
    templateUrl: './ukom-grade-surat-rekom-setup.component.html',
    styleUrl: './ukom-grade-surat-rekom-setup.component.scss',
})
export class UkomGradeSuratRekomSetupComponent implements OnInit {
    readonly fields = {
        letterHead: 'letterHead',
        dateLetterIssuance: 'dateLetterIssuance',
        signingOfficial: 'signingOfficial',
        officialPosition: 'officialPosition',
        officialNumber: 'officialNumber',
        classificationCode: 'numCode1',
        issuingUnit: 'numCode3',
        letterCategory: 'numCode4',
    }

    fb = inject(FormBuilder)
    formValidationService = inject(FormValidationService)
    handlerService = inject(HandlerService)
    suratRekomService = inject(SuratRekomService)
    sanitizer = inject(DomSanitizer)
    suratRekomForm: FormGroup

    templateHtml = signal<SafeHtml | null>(null)
    isLoadingTemplate = signal(false)
    showSetupModal = signal(false)

    inputs = signal<FIleHandler>({
        files: {
            [this.fields.letterHead]: { label: 'Kop Surat', required: true },
        },
        allowedTypes: [{ label: 'png', type: 'image/png' }],
        maxSize: 5 * 1024 * 1024, // 5 MB
        listen: (key: string, base64Data: string) => {
            this.suratRekomForm
                .get([this.fields.letterHead])
                ?.setValue(base64Data)
        },
    })

    submitLoading = signal(false)

    ngOnInit() {
        this.initForm()
        this.loadTemplate()
    }

    initForm() {
        this.suratRekomForm = this.fb.group({
            [this.fields.letterHead]: [null, Validators.required],
            [this.fields.dateLetterIssuance]: ['', Validators.required],
            [this.fields.signingOfficial]: ['', Validators.required],
            [this.fields.officialPosition]: ['', Validators.required],
            [this.fields.officialNumber]: ['', Validators.required],
            [this.fields.classificationCode]: ['', Validators.required],
            [this.fields.issuingUnit]: ['', Validators.required],
            [this.fields.letterCategory]: ['', Validators.required],
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.suratRekomForm.get(controlName),
            controlName,
            label,
        )
    }

    getMonthFromDate(): string {
        const dateValue = this.suratRekomForm.get('dateLetterIssuance')?.value
        if (!dateValue) return ''
        const [, month] = dateValue.split('-')
        return month || ''
    }

    getYearFromDate(): string {
        const dateValue = this.suratRekomForm.get('dateLetterIssuance')?.value
        if (!dateValue) return ''
        const [year] = dateValue.split('-')
        return year || ''
    }

    loadTemplate() {
        this.isLoadingTemplate.set(true)

        this.suratRekomService
            .previewSuratRekom()
            .pipe(finalize(() => this.isLoadingTemplate.set(false)))
            .subscribe({
                next: (response) => {
                    if (response && response.template) {
                        this.templateHtml.set(
                            this.sanitizer.bypassSecurityTrustHtml(
                                response.template,
                            ),
                        )
                    } else {
                        this.templateHtml.set(null)
                    }
                },
                error: (error) => {
                    console.error(error)
                    this.templateHtml.set(null)
                },
            })
    }

    openSetupModal() {
        this.showSetupModal.set(true)
    }

    closeSetupModal() {
        this.showSetupModal.set(false)
    }

    submitForm() {
        if (this.suratRekomForm.invalid) {
            this.handlerService.handleAlert(
                'Error',
                'Mohon lengkapi semua field yang diperlukan.',
            )
            return
        }

        this.submitLoading.set(true)

        let payload: CreatePreviewSuratRekomRequest

        try {
            payload = this.buildPayload()
        } catch (error) {
            this.submitLoading.set(false)
            this.handlerService.handleAlert(
                'Error',
                'Tanggal surat wajib diisi.',
            )
            return
        }

        this.suratRekomService
            .setupSuratRekom(payload)
            .pipe(finalize(() => this.submitLoading.set(false)))
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Surat Rekomendasi berhasil disimpan.',
                    )
                    this.closeSetupModal()
                    this.loadTemplate()
                    this.suratRekomForm.reset()
                },
                error: (error) => {
                    console.error(error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal menyimpan surat rekomendasi.',
                    )
                },
            })
    }

    private buildPayload(): CreatePreviewSuratRekomRequest {
        const dateValue: string =
            this.suratRekomForm.get('dateLetterIssuance')?.value

        if (!dateValue) {
            throw new Error('dateLetterIssuance is required')
        }

        const [tahun, bulan, day] = dateValue.split('-')

        const monthMap: Record<string, string> = {
            '01': 'Januari',
            '02': 'Februari',
            '03': 'Maret',
            '04': 'April',
            '05': 'Mei',
            '06': 'Juni',
            '07': 'Juli',
            '08': 'Agustus',
            '09': 'September',
            '10': 'Oktober',
            '11': 'November',
            '12': 'Desember',
        }

        const monthName = monthMap[bulan]

        if (!monthName) {
            throw new Error('Invalid month value')
        }

        const tanggalFormatted = `${day} ${monthName} ${tahun}`

        const rawLetterHead: string =
            this.suratRekomForm.get('letterHead')?.value

        const cleanedBase64 = rawLetterHead
            ? (rawLetterHead.split(',')[1] ?? rawLetterHead)
            : undefined

        return new CreatePreviewSuratRekomRequest({
            bulan,
            tahun,
            tanggal: tanggalFormatted,
            jabatanPenandatangan:
                this.suratRekomForm.get('officialPosition')?.value,
            namaPenandatangan:
                this.suratRekomForm.get('signingOfficial')?.value,
            nipPenandatangan: this.suratRekomForm.get('officialNumber')?.value,
            kopImg: cleanedBase64,
            numCode1: this.suratRekomForm.get('numCode1')?.value,
            numCode3: this.suratRekomForm.get('numCode3')?.value,
            numCode4: this.suratRekomForm.get('numCode4')?.value,
        })
    }
}
