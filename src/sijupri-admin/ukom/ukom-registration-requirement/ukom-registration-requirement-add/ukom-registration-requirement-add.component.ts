import { UkomRegistrationRuleService } from '@/modules/ukom/services/ukom-registration-rule.service'
import { Component } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
@Component({
    selector: 'app-ukom-registration-requirement-add',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LoadingButtonComponent],
    templateUrl: './ukom-registration-requirement-add.component.html',
    styleUrl: './ukom-registration-requirement-add.component.scss',
})
export class UkomRegistrationRequirementAddComponent {
    form: FormGroup

    constructor(
        private fb: FormBuilder,
        public jenjangService: JenjangService,
        public kinerjaService: KinerjaService,
        public jenisUkomService: JenisUkomService,
        public formValidationService: FormValidationService,
        public ukomRegistrationRuleService: UkomRegistrationRuleService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.jenjangService.fetchJenjang()
        this.kinerjaService.fetchRatingKinerja()
        this.kinerjaService.fetchPredikatKinerja()
        this.jenisUkomService.fetchJenisUkom()

        this.initForm()
    }

    initForm() {
        this.form = this.fb.group({
            jenjangCode: ['', Validators.required],
            angkaKreditThreshold: [
                null,
                [Validators.required, Validators.min(0)],
            ],
            lastNYear: [1, [Validators.required, Validators.min(1)]],
            ratingHasilId: ['', Validators.required],
            ratingKinerjaId: ['', Validators.required],
            predikatKinerjaId: ['', Validators.required],
            jenisUkom: ['', Validators.required],
        })
    }

    getError(controlName: string, label: string): string | null {
        const control = this.form.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    handleSuccess() {
        this.form.reset()
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                const body = this.form.value
                this.ukomRegistrationRuleService.createRule(body, () =>
                    this.handleSuccess(),
                )
            },
        })
    }
}
