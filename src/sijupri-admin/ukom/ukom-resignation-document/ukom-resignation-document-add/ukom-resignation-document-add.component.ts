import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Output } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { UkomDocumentService } from '@/modules/ukom/services/document.service'
import { JenjangService } from '@/modules/maintenance/services/jenjang.service'
import { JabatanService } from '@/modules/maintenance/services/jabatan.service'
import { JenisUkomService } from '@/modules/complement/services/jenis-ukom.service'
import { SpecificationService } from '@/modules/complement/services/specification.service'
import { LoadingButtonComponent } from '@/modules/base/components/loading-button/loading-button.component'
import { DokumenUkom } from '@/modules/ukom/models/ukom-registration-refactored/document.model'
import { InvalidOnTouchDirective } from '@/shared/invalid-on-touch.directive'
import { ResignationDocumentService } from '@/modules/ukom/services/document-resignation.service'

@Component({
    selector: 'app-ukom-resignation-document-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
        LoadingButtonComponent,
        InvalidOnTouchDirective,
    ],
    templateUrl: './ukom-resignation-document-add.component.html',
    styleUrl: './ukom-resignation-document-add.component.scss',
})
export class UkomResignationDocumentAddComponent {
    @Output() created = new EventEmitter<void>()

    documentForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)
    documentData: DokumenUkom

    constructor(
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        public documentService: ResignationDocumentService,
        public jenjangService: JenjangService,
        public jabatanService: JabatanService,
        public jenisUkomService: JenisUkomService,
        public specificationService: SpecificationService,
    ) {}

    ngOnInit() {
        this.handleFormInit()
        this.jabatanService.fetchJabatan()
        this.jenjangService.fetchJenjang()
    }

    getErrorMessage(controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.documentForm.get(controlName),
            controlName,
            label,
        )
    }

    handleFormInit() {
        this.documentForm = new FormGroup({
            dokumenPersyaratanName: new FormControl('', Validators.required),
            jenisUkom: new FormControl('', Validators.required),
            jabatanCode: new FormControl(''),
            jenjangCode: new FormControl(''),
            specification: new FormControl(null),
        })
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.documentData = new DokumenUkom(this.documentForm.value)
                this.documentService.createDocument(this.documentData, () => {
                    this.documentForm.reset()
                    // this.created.emit()
                })
            },
        })
    }
}
