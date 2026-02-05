import { Component, inject, OnInit, signal } from '@angular/core'
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { ActivatedRoute } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { HandlerService } from '@/modules/base/services/handler.service'

@Component({
    selector: 'app-add-definisi-operasional',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LoadingButtonComponent],
    templateUrl: './add-definisi-operasional.component.html',
    styleUrl: './add-definisi-operasional.component.scss',
})
export class AddDefinisiOperasionalComponent implements OnInit {
    fb = inject(FormBuilder)
    jenjangService = inject(JenjangService)
    definisiOperasionalForm: FormGroup
    formValidationService = inject(FormValidationService)
    confirmationService = inject(ConfirmationService)
    handlerService = inject(HandlerService)

    route = inject(ActivatedRoute)

    submitFormLoading = signal(false)
    ruangLingkupId: string | null

    get jenjangList(): FormArray {
        return this.definisiOperasionalForm.get('jenjangList') as FormArray
    }

    ngOnInit() {
        this.initForm()

        this.route.paramMap.subscribe((paramMap) => {
            this.ruangLingkupId = paramMap.get('id')
        })
        this.jenjangService.fetchJenjang()
    }

    initForm() {
        this.definisiOperasionalForm = this.fb.group({
            name: ['', Validators.required],
            skr: [0, [Validators.required, Validators.min(0)]],
            jenjangList: this.fb.array([]),
        })
    }

    createJenjang(jenjangCode?: string): FormGroup {
        return this.fb.group({
            jenjangCode: [jenjangCode ?? null, Validators.required],
            kontribusi: [
                0,
                [Validators.required, Validators.min(0), Validators.max(100)],
            ],
        })
    }

    isJenjangSelected(code: string): boolean {
        return this.jenjangList.value.some((j: any) => j.jenjangCode === code)
    }

    toggleJenjang(code: string, checked: boolean): void {
        if (checked) {
            this.jenjangList.push(this.createJenjang(code))
        } else {
            const index = this.jenjangList.value.findIndex(
                (j: any) => j.jenjangCode === code,
            )
            if (index > -1) {
                this.jenjangList.removeAt(index)
            }
        }
    }

    isFieldInvalid(name: string): boolean {
        const control = this.definisiOperasionalForm.get(name)
        return !!(control && control.invalid && control.touched)
    }

    isJenjangFieldInvalid(index: number, controlName: string): boolean {
        const control = this.jenjangList.at(index)?.get(controlName)

        return !!(
            control &&
            control.invalid &&
            (control.touched || control.dirty)
        )
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.definisiOperasionalForm.get(controlName),
            controlName,
            label,
        )
    }

    getJenjangControl(
        index: number,
        controlName: string,
    ): AbstractControl | null {
        return this.jenjangList.at(index)?.get(controlName) ?? null
    }

    getJenjangErrorMessage(
        index: number,
        controlName: string,
        label: string,
    ): string | null {
        return this.formValidationService.getErrorMessage(
            this.getJenjangControl(index, controlName),
            controlName,
            label,
        )
    }

    getJenjangName(code: string | null): string {
        if (!code) return ''

        const jenjangList = this.jenjangService.jenjangListSnapshot ?? []

        return jenjangList.find((j) => j.code === code)?.name ?? code
    }

    submitForm() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                if (!this.ruangLingkupId) {
                    this.handlerService.handleAlert(
                        'Error',
                        'Ruang Lingkup tidak ditemukan. Silakan coba lagi.',
                    )
                    return
                }

                this.submitFormLoading.set(true)

                //TODO: submit with real api
                setTimeout(() => {
                    this.submitFormLoading.set(false)
                    this.definisiOperasionalForm.reset()
                    this.jenjangList.clear()
                    this.handlerService.handleAlert(
                        'Success',
                        'Berhasil menyimpan definisi operasional.',
                    )
                }, 2000)
            },
        })
    }
}
