import {
    Component,
    effect,
    ElementRef,
    inject,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core'
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
import {
    SuratRekomCounterResponse,
    SuratRekomService,
} from '@/modules/ukom/services/surat-rekom.service'
import { CreatePreviewSuratRekomRequest } from '@/modules/ukom/models/surat-rekom/create-preview-surat-rekom-request.model'
import { ModalComponent } from '@/modules/base/components/modal/modal.component'

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
    // TODO: Make the template from backend 1 page size in A4 paper
    @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>

    readonly fields = {
        letterHead: 'letterHead',
        dateLetterIssuance: 'dateLetterIssuance',
        ditetapkan: 'ditetapkan',
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
    suratRekomForm: FormGroup
    counterForm: FormGroup

    templateHtml = signal<string | null>(null)
    isLoadingTemplate = signal(false)
    showSetupModal = signal(false)
    showCounterModal = signal(false)
    currentCounterNum = signal<number | null>(null)
    isLoadingCounter = signal(false)
    counterSubmitLoading = signal(false)
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

    constructor() {
        effect(() => {
            const htmlContent = this.templateHtml()
            // Using a slightly longer timeout to ensure *ngIf has processed and DOM is ready
            if (htmlContent) {
                setTimeout(() => {
                    this.updateIframeContent(htmlContent)
                }, 100)
            }
        })
    }

    ngOnInit() {
        this.initForm()
        this.loadTemplate()
        this.loadCounter()
    }

    initForm() {
        this.suratRekomForm = this.fb.group({
            [this.fields.letterHead]: [null, Validators.required],
            [this.fields.dateLetterIssuance]: ['', Validators.required],
            [this.fields.ditetapkan]: ['', Validators.required],
            [this.fields.signingOfficial]: ['', Validators.required],
            [this.fields.officialPosition]: ['', Validators.required],
            [this.fields.officialNumber]: ['', Validators.required],
            [this.fields.classificationCode]: ['', Validators.required],
            [this.fields.issuingUnit]: ['', Validators.required],
            [this.fields.letterCategory]: ['', Validators.required],
        })

        this.counterForm = this.fb.group({
            value: [null, [Validators.required, Validators.min(1)]],
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

    counterNumDisplay(): string {
        if (this.isLoadingCounter()) return '...'
        return `${this.currentCounterNum() ?? ''}`
    }

    loadTemplate() {
        this.isLoadingTemplate.set(true)

        this.suratRekomService
            .previewSuratRekom()
            .pipe(finalize(() => this.isLoadingTemplate.set(false)))
            .subscribe({
                next: (response) => {
                    if (response && response.template) {
                        this.templateHtml.set(response.template)
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

    updateIframeContent(htmlString: string) {
        // Double check if previewFrame is available
        if (!this.previewFrame?.nativeElement) {
            // If not available yet, try again shortly (retry logic)
            setTimeout(() => this.updateIframeContent(htmlString), 100)
            return
        }

        const iframe = this.previewFrame.nativeElement
        // Add error handling/checking for contentWindow
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            doc.write(htmlString)
            doc.close()
        }
    }

    printPreview() {
        const iframe = this.previewFrame?.nativeElement
        if (iframe?.contentWindow) {
            iframe.contentWindow.focus()
            iframe.contentWindow.print()
        }
    }

    openSetupModal() {
        this.showSetupModal.set(true)
    }

    closeSetupModal() {
        this.showSetupModal.set(false)
    }

    openCounterModal() {
        this.counterForm.patchValue({ value: this.currentCounterNum() })
        this.showCounterModal.set(true)
    }

    closeCounterModal() {
        this.showCounterModal.set(false)
    }

    getCounterErrorMessage(): string | null {
        return this.formValidationService.getErrorMessage(
            this.counterForm.get('value'),
            'value',
            'Nomor Surat',
        )
    }

    loadCounter() {
        this.isLoadingCounter.set(true)
        this.suratRekomService
            .getRekomCounter()
            .pipe(finalize(() => this.isLoadingCounter.set(false)))
            .subscribe({
                next: (response: SuratRekomCounterResponse) => {
                    this.currentCounterNum.set(response?.num ?? null)
                },
                error: (error) => {
                    console.error(error)
                    this.currentCounterNum.set(null)
                },
            })
    }

    submitCounterForm() {
        if (this.counterForm.invalid) {
            this.handlerService.handleAlert('Error', 'Nomor surat wajib diisi.')
            return
        }

        const value = Number(this.counterForm.get('value')?.value)
        this.counterSubmitLoading.set(true)

        this.suratRekomService
            .updateRekomCounter(value)
            .pipe(finalize(() => this.counterSubmitLoading.set(false)))
            .subscribe({
                next: () => {
                    this.handlerService.handleAlert(
                        'Success',
                        'Nomor surat berhasil diperbarui.',
                    )
                    this.closeCounterModal()
                    this.loadCounter()
                },
                error: (error) => {
                    console.error(error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memperbarui nomor surat.',
                    )
                },
            })
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
                    // Reload template to update iframe
                    this.loadTemplate()
                    // this.suratRekomForm.reset() // Optional: based on requirements
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
            ditetapkan: this.suratRekomForm.get('ditetapkan')?.value,
        })
    }
}
