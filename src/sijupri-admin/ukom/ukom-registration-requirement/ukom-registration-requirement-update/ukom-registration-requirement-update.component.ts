import { Component, EventEmitter, Input, Output } from '@angular/core'
import {
    FormBuilder,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { UkomRegistrationRuleService } from '@/modules/ukom/services/ukom-registration-rule.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { UkomRegistrationRequirement } from '@/modules/ukom/models/ukom-registration-refactored/ukom-registration-rule.model'

@Component({
    selector: 'app-ukom-registration-requirement-update',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LoadingButtonComponent],
    templateUrl: './ukom-registration-requirement-update.component.html',
    styleUrl: './ukom-registration-requirement-update.component.scss',
})
export class UkomRegistrationRequirementUpdateComponent {
    private _rule: UkomRegistrationRequirement
    @Output() updated = new EventEmitter<void>() // emits updated rule

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

    // ✅ Setter triggers whenever parent sets the rule
    @Input()
    set rule(value: UkomRegistrationRequirement) {
        this._rule = value
        if (value && this.form) {
            this.patchForm(value)
        }
    }
    get rule(): UkomRegistrationRequirement {
        return this._rule
    }

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

        // Patch form if rule was already set before ngOnInit
        if (this._rule) {
            this.patchForm(this._rule)
        }
    }

    patchForm(rule: UkomRegistrationRequirement) {
        this.form.patchValue({
            jenjangCode: rule.jenjangCode,
            angkaKreditThreshold: rule.angkaKreditThreshold,
            lastNYear: rule.lastNYear,
            ratingHasilId: rule.ratingHasilId,
            ratingKinerjaId: rule.ratingKinerjaId,
            predikatKinerjaId: rule.predikatKinerjaId,
            jenisUkom: rule.jenisUkom,
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
        this.updated.emit()
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return
                const body = { ...this._rule, ...this.form.value } // include id for update
                this.ukomRegistrationRuleService.updateRule(body, () =>
                    this.handleSuccess(),
                )
            },
        })
    }
}
