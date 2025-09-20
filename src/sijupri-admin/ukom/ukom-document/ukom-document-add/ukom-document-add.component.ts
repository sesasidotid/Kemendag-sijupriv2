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
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { BehaviorSubject } from 'rxjs'
import { Router } from '@angular/router'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { Observable } from 'rxjs'
import { finalize, map } from 'rxjs/operators'
import { DataDokumenUkom } from '../../../../modules/ukom/models/data-dukung'
import { Jabatan } from '../../../../modules/maintenance/models/jabatan.model'
import { Jenjang } from '../../../../modules/maintenance/models/jenjang.modle'
import { FormValidationService } from '../../../../modules/base/services/form-validation.service'

@Component({
    selector: 'app-ukom-document-add',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ReactiveFormsModule,
    ],
    templateUrl: './ukom-document-add.component.html',
    styleUrl: './ukom-document-add.component.scss',
})
export class UkomDocumentAddComponent {
    @Output() changeTabActive: EventEmitter<any> = new EventEmitter()
    tab$ = new BehaviorSubject<number | null>(0)

    documentForm: FormGroup
    submitLoading$ = new BehaviorSubject<boolean>(false)
    documentData: DataDokumenUkom = new DataDokumenUkom()

    jabatanList$: Observable<Jabatan[]>
    jenjangList$: Observable<Jenjang[]>

    constructor(
        private confirmationService: ConfirmationService,
        private apiService: ApiService,
        private handlerService: HandlerService,
        private formValidationService: FormValidationService,
    ) {}

    ngOnInit() {
        this.handleFormInit()
        this.getJenjangList()
        this.getJabatanList()
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
            isMengulang: new FormControl(false, Validators.required),
        })
    }

    getJenjangList() {
        this.jenjangList$ = this.apiService
            .getData(`/api/v1/jenjang`)
            .pipe(
                map((response) =>
                    response.map(
                        (jenjang: { [key: string]: any }) =>
                            new Jenjang(jenjang),
                    ),
                ),
            )
    }

    getJabatanList() {
        this.jabatanList$ = this.apiService
            .getData(`/api/v1/jabatan`)
            .pipe(
                map((response) =>
                    response.map(
                        (jabatan: { [key: string]: any }) =>
                            new Jabatan(jabatan),
                    ),
                ),
            )
    }

    submit() {
        this.confirmationService.open(false).subscribe({
            next: ({ confirmed }) => {
                if (!confirmed) return

                this.submitLoading$.next(true)

                let {
                    dokumenPersyaratanName,
                    jenisUkom,
                    jabatanCode,
                    jenjangCode,
                    isMengulang,
                } = this.documentForm.value

                Object.assign(this.documentData, {
                    dokumenPersyaratanName,
                    jenisUkom,
                    jabatanCode,
                    jenjangCode,
                    isMengulang,
                })

                this.apiService
                    .postData(
                        `/api/v1/document_ukom/dokumen_persyaratan`,
                        this.documentData,
                    )
                    .pipe(
                        finalize(() => {
                            this.submitLoading$.next(false)
                        }),
                    )
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Data berhasil disimpan',
                            )
                            this.changeTabActive.emit(0)
                        },
                        error: (error) => {
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan data',
                            )
                        },
                    })
            },
        })
    }
}
