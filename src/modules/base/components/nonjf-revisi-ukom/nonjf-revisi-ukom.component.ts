import { Component, Input, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PesertaUkom } from '../../../../modules/ukom/models/peserta-ukom.model'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { UkomTaskDetail } from '../../../../modules/ukom/models/ukom-task-detail.modal'
import { RevisiDokumenUkom } from '../../../../modules/ukom/models/revisi-dokumen-ukom.model'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
import { BehaviorSubject } from 'rxjs'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { Pangkat } from '../../../maintenance/models/pangkat.model'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
    selector: 'app-nonjf-revisi-ukom',
    standalone: true,
    imports: [
        FileHandlerComponent,
        CommonModule,
        ConfirmationDialogComponent,
        FilePreviewComponent,
        ReactiveFormsModule,
        FormsModule
    ],
    templateUrl: './nonjf-revisi-ukom.component.html',
    styleUrl: './nonjf-revisi-ukom.component.scss'
})
export class NonjfRevisiUkomComponent {
    @Input() pendingTask: UkomTaskDetail = new UkomTaskDetail()
    @Input() key: string = ''
    revisedDokumen: RevisiDokumenUkom = new RevisiDokumenUkom()
    rejectedDokumen: any[] = []
    detectedDokumen: any = {}
    pesertaUkom: PesertaUkom = new PesertaUkom()
    isDetailIncorrect: boolean = false
    pangkatList$: Observable<Pangkat[]>
    showForm: boolean = false

    inputs: FIleHandler = {
        files: {},
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
            remark: string
        ) => {
            this.detectedDokumen[key] = {
                base64: base64Data,
                label: label,
                remark: remark
            }
        }
    }
    hadItemsLoading$ = new BehaviorSubject<boolean>(false)
    defaultValues: any = {}
    updateNonJFForm: FormGroup
    constructor(
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        console.log('pendingTask', this.pendingTask)
        this.updateNonJFForm = new FormGroup({
            name: new FormControl('', Validators.required),
            email: new FormControl('', Validators.required),
            unitKerjaName: new FormControl('', Validators.required)
        })

        this.getRejectedDokumen()
        this.handleRejectedDokumen()
        this.getListPanngkat()
        this.setDefaultFormValues(this.pendingTask)
    }

    setDefaultFormValues(data: UkomTaskDetail) {
        this.defaultValues = { ...data }

        this.updateNonJFForm.patchValue({
            name: data.name || '',
            email: data.email || '',
            unitKerjaName: data.unitKerjaName || ''
        })
    }

    onCheckboxChange() {
        if (!this.showForm) {
            this.setDefaultFormValues(this.defaultValues)
            this.updateNonJFForm.markAsPristine() // Mark form as untouched
        }
    }

    getRejectedDokumen() {
        console.log('getRejectedDokumen called')
        if (this.pendingTask?.dokumenUkomList?.length) {
            this.rejectedDokumen = this.pendingTask.dokumenUkomList.filter(
                dokumen => dokumen.dokumenStatus.toLowerCase() === 'reject'
            )
            console.log('rejectedDokumen', this.rejectedDokumen)
        } else {
            console.warn('No documents found in pendingTask.dokumenUkomList')
        }
    }

    getListPanngkat() {
        this.pangkatList$ = this.apiService
            .getData(`/api/v1/pangkat`)
            .pipe(
                map(response =>
                    response.map(
                        (pangkat: { [key: string]: any }) => new Pangkat(pangkat)
                    )
                )
            )
    }

    handleRejectedDokumen() {
        this.inputs.files = {}
        this.rejectedDokumen.forEach((dokumen, index) => {
            // const key = `rejectedDokumen_${index + 1}`
            const key = dokumen.dokumenPersyaratanId
            this.inputs.files[key] = {
                label: dokumen.dokumenPersyaratanName || 'Unknown Document',
                remark: dokumen.remark,
            }
        })
    }

    isAnyFileMissing(): boolean {
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true;
        }

        return Object.keys(this.inputs.files).some(key => {
            return !this.detectedDokumen[key]
        })
    }

    onSave() {
        console.log(this.key)

        if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
            this.pesertaUkom.dokumenUkomList = []
        }

        const documentMap = new Map()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]

                const existingDokumen = this.pendingTask.dokumenUkomList.find(
                    // dokumen => dokumen.dokumenPersyaratanName === detected.label
                    dokumen => dokumen.dokumenPersyaratanId === key
                )

                if (existingDokumen) {
                    const newDoc = {
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${this.pendingTask.nip
                            }_dokumenPersyaratanUkom_${Date.now()}_${existingDokumen.dokumenPersyaratanName}`,
                        dokumenPersyaratanId: existingDokumen.dokumenPersyaratanId
                    }

                    documentMap.set(existingDokumen.dokumenPersyaratanId, newDoc)
                }
            }
        }

        this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

        if (this.showForm) {
            this.pesertaUkom.name = this.updateNonJFForm.get('name').value
            this.pesertaUkom.email = this.updateNonJFForm.get('email').value
            this.pesertaUkom.unitKerjaName =
                this.updateNonJFForm.get('unitKerjaName').value
        }

        this.revisedDokumen.id = this.pendingTask.id
        // this.revisedDokumen.taskAction = 'approve'
        this.revisedDokumen.taskAction = 'amend'
        this.revisedDokumen.object = this.pesertaUkom

        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) {
                    return
                }
                this.hadItemsLoading$.next(true)

                this.apiService
                    .postData(
                        `/api/v1/participant_ukom/task/non_jf/submit?key=${this.key}`,
                        this.revisedDokumen
                    )
                    .subscribe({
                        next: () => {
                            this.hadItemsLoading$.next(false)
                            window.location.reload()
                        },
                        error: error => {
                            this.hadItemsLoading$.next(false)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal mengupload dokumen'
                            )
                        }
                    })
            }
        })
    }
}
