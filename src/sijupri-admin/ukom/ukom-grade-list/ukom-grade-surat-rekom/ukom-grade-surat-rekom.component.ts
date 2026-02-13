import { Component, inject, OnInit, signal } from '@angular/core'
import { TabService } from '@/modules/base/services/tab.service'
import { Router } from '@angular/router'
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
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { HttpClient } from '@angular/common/http'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-ukom-grade-surat-rekom',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        FileHandlerComponent,
        InvalidOnTouchDirective,
        CommonModule,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-grade-surat-rekom.component.html',
    styleUrl: './ukom-grade-surat-rekom.component.scss',
})
export class UkomGradeSuratRekomComponent implements OnInit {
    readonly fields = {
        letterHead: 'letterHead',
        dateLetterIssuance: 'dateLetterIssuance',
        signingOfficial: 'signingOfficial',
        officialPosition: 'officialPosition',
        officialNumber: 'officialNumber',
    }

    tabService = inject(TabService)
    router = inject(Router)
    fb = inject(FormBuilder)
    formValidationService = inject(FormValidationService)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)
    suratRekomForm: FormGroup

    inputs = signal<FIleHandler>({
        files: {
            [this.fields.letterHead]: { label: 'Kop Surat', required: true },
        },
        allowedTypes: [
            { label: 'jpg', type: 'image/jpeg' },
            { label: 'jpeg', type: 'image/jpeg' },
            { label: 'png', type: 'image/png' },
        ],
        maxSize: 5 * 1024 * 1024, // 5 MB
        listen: (key: string, base64Data: string) => {
            this.suratRekomForm
                .get([this.fields.letterHead])
                ?.setValue(base64Data)
        },
    })

    previewLoading = signal(false)
    submitLoading = signal(false)

    // TODO: Remove when real api ready
    private http = inject(HttpClient)

    ngOnInit() {
        this.initForm()

        setTimeout(() => this.initTab(), 0)
    }

    initForm() {
        this.suratRekomForm = this.fb.group({
            [this.fields.letterHead]: [null, Validators.required],
            [this.fields.dateLetterIssuance]: ['', Validators.required],
            [this.fields.signingOfficial]: ['', Validators.required],
            [this.fields.officialPosition]: ['', Validators.required],
            [this.fields.officialNumber]: ['', Validators.required],
        })
    }

    initTab() {
        if (this.tabService.getTabsLength() > 0) {
            this.tabService.clearTabs()
        }

        this.tabService
            .addTab({
                label: 'List Nilai Ukom',
                isActive: false,
                icon: 'mdi-list-box',
                onClick: () => this.router.navigate([`/ukom/ukom-grade-list`]),
            })
            .addTab({
                label: 'Import Nilai',
                isActive: false,
                icon: 'mdi-plus-circle',
                onClick: () =>
                    this.router.navigate([`/ukom/ukom-grade-list/import`]),
            })
            .addTab({
                label: 'Export Nilai',
                isActive: false,
                icon: 'mdi-export',
                onClick: () =>
                    this.router.navigate([`/ukom/ukom-grade-list/export`]),
            })
            .addTab({
                label: 'Surat Rekomendasi',
                isActive: true,
                icon: 'mdi-email-seal-outline',
                onClick: () =>
                    this.router.navigate([
                        `/ukom/ukom-grade-list/letter-of-reccomendation`,
                    ]),
            })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.suratRekomForm.get(controlName),
            controlName,
            label,
        )
    }

    previewLetterResult() {
        this.previewLoading.set(true)

        this.http
            .get('/assets/template/surat-rekom-preview.html', {
                responseType: 'text',
            })
            .pipe(finalize(() => this.previewLoading.set(false)))
            .subscribe({
                next: (html: string) => {
                    const previewWindow = window.open('', '_blank')
                    if (!previewWindow) return

                    previewWindow.document.open()
                    previewWindow.document.write(html)
                    previewWindow.document.close()
                },
                error: (error) => {
                    console.error(error)
                    this.handlerService.handleAlert(
                        'Error',
                        'Gagal memuat preview.',
                    )
                },
            })
    }

    submitForm() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitLoading.set(true)

                setTimeout(() => {
                    this.submitLoading.set(false)
                    this.handlerService.handleAlert(
                        'Success',
                        'Surat Rekomendasi sedang diproses di sistem. Silahkan tunggu beberapa saat.',
                    )
                })
            },
        })
    }
}
