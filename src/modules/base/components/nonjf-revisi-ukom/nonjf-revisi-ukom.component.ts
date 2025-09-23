import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ApiService } from '../../../../modules/base/services/api.service'
import { HandlerService } from '../../../../modules/base/services/handler.service'
import { FileHandlerComponent } from '../../../../modules/base/components/file-handler/file-handler.component'
import { FIleHandler } from '../../../../modules/base/commons/file-handler/file-handler'
import { ConfirmationService } from '../../../../modules/base/services/confirmation.service'
import { UkomTaskDetail } from '../../../../modules/ukom/models/ukom-task-detail.modal'
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component'
import { FilePreviewComponent } from '../file-preview/file-preview.component'
import { BehaviorSubject, forkJoin, map } from 'rxjs'
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms'
import { Pangkat } from '../../../maintenance/models/pangkat.model'
import { Observable } from 'rxjs'
import { UkomFlowId } from '@/modules/ukom/models/ukom-registration-refactored/pending-task.model'
import { Task } from '@/modules/workflow/models/task.model'
import { NonJFParticipantUkomTask } from '@/modules/ukom/models/ukom-registration-refactored/non-jf-participant-ukom-task.model'
import { PangkatService } from '@/modules/maintenance/services/pangkat.service'
import { UkomParticipantService } from '@/modules/ukom/services/participant.service'
import { DokumenUkomList } from '@/modules/ukom/models/ukom-task-detail.modal'
import { LoadingButtonComponent } from '../loading-button/loading-button.component'
import { FormValidationService } from '../../services/form-validation.service'
import { JenisInstansiService } from '@/modules/complement/services/jenis-instansi.service'
import { KinerjaService } from '@/modules/complement/services/kinerja.service'
import { PendidikanService } from '@/modules/complement/services/pendidikan-ukom.service'
import { ProvinsiService } from '@/modules/maintenance/services/provinsi.service'
import { KabKotaService } from '@/modules/maintenance/services/kab-kota.service'
import { Provinsi } from '@/modules/maintenance/models/provinsi.model'
import { KabKota } from '@/modules/maintenance/models/kab-kota.model'
@Component({
    selector: 'app-nonjf-revisi-ukom',
    standalone: true,
    imports: [
        FileHandlerComponent,
        CommonModule,
        ConfirmationDialogComponent,
        FilePreviewComponent,
        ReactiveFormsModule,
        FormsModule,
        LoadingButtonComponent,
    ],
    templateUrl: './nonjf-revisi-ukom.component.html',
    styleUrl: './nonjf-revisi-ukom.component.scss',
})
export class NonjfRevisiUkomComponent {
    @Input() pendingTask = new UkomTaskDetail()
    @Input() key: string = ''
    revisedDokumen = new Task()
    rejectedDokumen: DokumenUkomList[] = []
    detectedDokumen: Record<
        string,
        {
            base64: string
            label: string
            remark: string
        }
    > = {}
    pesertaUkom = new NonJFParticipantUkomTask()
    isDetailIncorrect: boolean = false
    pangkatList$: Observable<Pangkat[]>
    showForm: boolean = false

    provinsiList$: Observable<Provinsi[]>
    kabKotaList$: Observable<KabKota[]>

    inputs: FIleHandler = {
        files: {},
        maxSize: 2 * 1024 * 1024,
        allowedTypes: [{ type: 'application/pdf' }],
        listen: (
            key: string,
            source: string,
            base64Data: string,
            label: string,
            remark: string,
        ) => {
            this.detectedDokumen[key] = {
                base64: base64Data,
                label: label,
                remark: remark,
            }
        },
    }
    defaultValues: unknown = {}
    updateNonJFForm: FormGroup

    constructor(
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        public pangkatService: PangkatService,
        public ukomParticipantService: UkomParticipantService,
        private formValidationService: FormValidationService,
        public jenisInstansiService: JenisInstansiService,
        public kinerjaService: KinerjaService,
        public pendidikanService: PendidikanService,
        private provinsiService: ProvinsiService,
        private kabKotaService: KabKotaService,
    ) {}

    ngOnInit() {
        this.initForm()
        this.kinerjaService.fetchPredikatKinerja()
        this.pendidikanService.fetchPendidikan()
        this.pangkatService.findAll()
        this.pangkatList$ = this.pangkatService.findAll()
        this.provinsiList$ = this.provinsiService.findAll()
        this.getRejectedDokumen()
        this.handleRejectedDokumen()
        this.setDefaultFormValues(this.pendingTask)
        this.setupFormValidation()

        const jenisInstansiControl = this.updateNonJFForm.get('jenisInstansi')
        if (jenisInstansiControl?.value) {
            jenisInstansiControl.updateValueAndValidity({ emitEvent: true })
        }
        this.updateNonJFForm.valueChanges.subscribe(() => {
            if (this.updateNonJFForm.invalid) {
                const invalidControls = this.findInvalidControlsWithReasons(
                    this.updateNonJFForm,
                )
                console.log('Invalid controls with reasons:', invalidControls)
            }
        })
    }

    //helper to check form controls validity
    private findInvalidControlsWithReasons(form: FormGroup): {
        [key: string]: any
    } {
        const invalidControls: { [key: string]: any } = {}

        Object.keys(form.controls).forEach((key) => {
            const control = form.get(key)
            if (control && control.invalid && control.errors) {
                invalidControls[key] = control.errors
            }
        })

        return invalidControls
    }
    getErrorMessage(controlName: string, label: string): string | null {
        const control = this.updateNonJFForm.get(controlName)
        return this.formValidationService.getErrorMessage(
            control,
            controlName,
            label,
        )
    }

    initForm() {
        this.updateNonJFForm = this.fb.group({
            name: ['', Validators.required],
            tempatLahir: ['', Validators.required],
            tanggalLahir: ['', Validators.required],
            phone: [
                '',
                [Validators.required, Validators.pattern(/^\d{10,15}$/)],
            ],
            email: ['', [Validators.required, Validators.email]],

            jenisInstansi: ['', Validators.required],
            provinsiId: [''],
            kabupatenKotaId: [''],
            unitKerjaName: ['', Validators.required],
            jabatanName: ['', [Validators.required]],
            jenjangName: ['', []],
            tmtJabatan: ['', Validators.required],
            pangkatCode: ['', Validators.required],
            tmtPangkat: ['', Validators.required],
            noSuratUsulan: ['', Validators.required],
            tglSuratUsulan: ['', Validators.required],

            pendidikanTerakhirCode: ['', Validators.required],
            jurusan: ['', Validators.required],
            predikatKinerja1Id: ['', Validators.required],
            predikatKinerja2Id: ['', Validators.required],
        })
    }

    setDefaultFormValues(data: UkomTaskDetail) {
        this.defaultValues = { ...data }
        this.updateNonJFForm.patchValue({
            name: data.name || '',
            tempatLahir: data.tempatLahir || '',
            tanggalLahir: data.tanggalLahir || '',
            phone: data.phone || '',
            email: data.email || '',
            jenisInstansi: data.jenisInstansi || '',
            provinsiId: data.provinsiId || '',
            kabupatenKotaId: data.kabupatenKotaId || '',
            unitKerjaName: data.unitKerjaName || '',
            jabatanName: data.jabatanName || '',
            jenjangName: data.jenjangName || '',
            tmtJabatan: data.tmtJabatan || '',
            pangkatCode: data.pangkatCode || '',
            tmtPangkat: data.tmtPangkat || '',
            noSuratUsulan: data.noSuratUsulan || '',
            tglSuratUsulan: data.tglSuratUsulan || '',
            pendidikanTerakhirCode: data.pendidikanTerakhirCode || '',
            jurusan: data.jurusan || '',
            predikatKinerja1Id: data.predikatKinerja1Id || '',
            predikatKinerja2Id: data.predikatKinerja2Id || '',
        })
    }

    setupFormValidation() {
        const provinceControl = this.updateNonJFForm.get('provinsiId')
        const kabupatenKotaControl = this.updateNonJFForm.get('kabupatenKotaId')

        this.updateNonJFForm
            .get('jenisInstansi')
            ?.valueChanges.subscribe((value) => {
                provinceControl?.clearValidators()
                kabupatenKotaControl?.clearValidators()

                if (value === 'PEMERINTAH_PROVINSI') {
                    provinceControl?.setValidators([Validators.required])
                } else if (value === 'PEMERINTAH_KABUPATEN_KOTA') {
                    provinceControl?.setValidators([Validators.required])
                    kabupatenKotaControl?.setValidators([Validators.required])

                    provinceControl?.valueChanges.subscribe((provinsiId) => {
                        if (provinsiId) {
                            this.kabKotaList$ = forkJoin([
                                this.kabKotaService.findByTypeAndProvinsiId(
                                    'KABUPATEN',
                                    provinsiId,
                                ),
                                this.kabKotaService.findByTypeAndProvinsiId(
                                    'KOTA',
                                    provinsiId,
                                ),
                            ]).pipe(
                                map(([list1, list2]) => [...list1, ...list2]),
                            )
                        }
                    })
                }

                provinceControl?.updateValueAndValidity()
                kabupatenKotaControl?.updateValueAndValidity()
            })
    }

    onCheckboxChange() {
        if (!this.showForm) {
            this.setDefaultFormValues(this.defaultValues as UkomTaskDetail)
            this.updateNonJFForm.markAsPristine()
        }
    }

    getRejectedDokumen() {
        if (this.pendingTask?.dokumenUkomList?.length) {
            this.rejectedDokumen = this.pendingTask.dokumenUkomList.filter(
                (dokumen) => dokumen.dokumenStatus.toLowerCase() === 'reject',
            )
            console.log(this.rejectedDokumen, 'rejectedDokumen')
        }
    }

    handleRejectedDokumen() {
        this.inputs.files = {}
        this.rejectedDokumen.forEach((dokumen, index) => {
            const key = dokumen.dokumenPersyaratanId
            this.inputs.files[key] = {
                label: dokumen.dokumenPersyaratanName || 'Unknown Document',
                remark: dokumen.remark,
            }
        })
    }

    isAnyFileMissing(): boolean {
        if (!this.inputs.files || Object.keys(this.inputs.files).length === 0) {
            return true
        }

        return Object.keys(this.inputs.files).some((key) => {
            return !this.detectedDokumen[key]
        })
    }

    onSave() {
        if (!Array.isArray(this.pesertaUkom.dokumenUkomList)) {
            this.pesertaUkom.dokumenUkomList = []
        }

        const documentMap = new Map()

        for (const key in this.detectedDokumen) {
            if (this.detectedDokumen.hasOwnProperty(key)) {
                const detected = this.detectedDokumen[key]

                const existingDokumen = this.pendingTask.dokumenUkomList.find(
                    (dokumen) => dokumen.dokumenPersyaratanId === key,
                )

                if (existingDokumen) {
                    const newDoc = {
                        dokumenFile: detected.base64,
                        dokumenPersyaratanName: `${
                            this.pendingTask.nip
                        }_dokumenPersyaratanUkom_${Date.now()}_${existingDokumen.dokumenPersyaratanName}`,
                        dokumenPersyaratanId:
                            existingDokumen.dokumenPersyaratanId,
                    }

                    documentMap.set(
                        existingDokumen.dokumenPersyaratanId,
                        newDoc,
                    )
                }
            }
        }

        this.pesertaUkom.dokumenUkomList = Array.from(documentMap.values())

        if (this.showForm) {
            const formValues = this.updateNonJFForm.getRawValue()

            this.pesertaUkom = new NonJFParticipantUkomTask({
                ...this.pesertaUkom,
                ...formValues,
            })
        }

        this.revisedDokumen = new Task({
            id: this.pendingTask.id,
            taskAction: UkomFlowId.UkomFlowId1,
            object: this.pesertaUkom,
        })

        this.confirmationService.open(false).subscribe({
            next: (result) => {
                if (!result.confirmed) {
                    return
                }
                this.ukomParticipantService.submitUkomTaskNonJF(
                    this.revisedDokumen,
                    this.key,
                    () => {
                        window.location.reload()
                    },
                )
            },
        })
    }
}
