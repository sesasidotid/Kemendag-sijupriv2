import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, Output } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { SpecificationService } from '@/modules/complement/services/specification.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { DokumenUkom } from '@/modules/ukom/models/ukom-registration-refactored/document.model'
@Component({
    selector: 'app-ukom-document-update',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './ukom-document-update.component.html',
})
export class UkomDocumentUpdateComponent {
    @Input() _document: DokumenUkom
    @Output() updated = new EventEmitter<void>()

    form: FormGroup

    constructor(
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        public documentService: UkomDocumentService,
        public jenjangService: JenjangService,
        public jabatanService: JabatanService,
        public jenisUkomService: JenisUkomService,
        public specificationService: SpecificationService,
        private fb: FormBuilder,
    ) {}

    @Input()
    set document(value: DokumenUkom) {
        this._document = value
        if (value && this.form) {
            this.patchForm(value)
        }
    }
    get document(): DokumenUkom {
        return this._document
    }

    ngOnInit() {
        this.jabatanService.fetchJabatan()
        this.jenjangService.fetchJenjang()
        this.jenisUkomService.fetchJenisUkom()
        this.initForm()
    }

    patchForm(document: DokumenUkom) {
        this.form.patchValue({
            dokumenPersyaratanId: document.dokumenPersyaratanId,
            dokumenPersyaratanName: document.dokumenPersyaratanName,
            jenisUkom: document.jenisUkom,
            jabatanCode: document.jabatanCode,
            jenjangCode: document.jenjangCode,
            isMengulang: document.isMengulang,
            specification: document.specification,
        })
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.form.get(controlName),
            controlName,
            label,
        )
    }

    initForm() {
        this.form = this.fb.group({
            dokumenPersyaratanId: new FormControl({
                value: null,
                disabled: true,
            }),
            dokumenPersyaratanName: new FormControl('', Validators.required),
            jenisUkom: new FormControl('', Validators.required),
            jabatanCode: new FormControl(null),
            jenjangCode: new FormControl(null),
            isMengulang: new FormControl(false, Validators.required),
            specification: new FormControl(null),
        })

        if (this._document) {
            this.patchForm(this._document)
        }
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                const updatedDocumentData = new DokumenUkom(
                    this.form.getRawValue(),
                )
                this.documentService.updateDocument(updatedDocumentData, () => {
                    this.form.reset()
                    this.updated.emit()
                })
            },
        })
    }
}
