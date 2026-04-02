import { Component } from '@angular/core'
import { PagableComponent } from '@/modules/base/components/pagable/pagable.component'
import {
    ActionColumnBuilder,
    PagableBuilder,
    PrimaryColumnBuilder
} from '@/modules/base/commons/pagable/pagable-builder'
import { Pagable } from '@/modules/base/commons/pagable/pagable'
import { CommonModule } from '@angular/common'
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms'
import { RWKinerja } from '@/modules/siap/models/rw-kinerja.model'
import { PendingTask } from '@/modules/workflow/models/pending-task.model'
import { ApiService } from '@/modules/base/services/api.service'
import { HandlerService } from '@/modules/base/services/handler.service'
import { ConfirmationService } from '@/modules/base/services/confirmation.service'
import { Task } from '@/modules/workflow/models/task.model'
import { RatingKinerja } from '@/modules/maintenance/models/rating-kinerja.model'
import { PredikatKinerja } from '@/modules/maintenance/models/predikat-kinerja.model'
import { FIleHandler } from '@/modules/base/commons/file-handler/file-handler'
import { FileHandlerComponent } from '@/modules/base/components/file-handler/file-handler.component'
import { BehaviorSubject } from 'rxjs'
import { FormValidationService } from '@/modules/base/services/form-validation.service'
import { PendingTaskService } from '@/modules/workflow/services/pending-task.service'

@Component({
    selector: 'app-rw-kinerja-pending',
    standalone: true,
    imports: [
        PagableComponent,
        CommonModule,
        FormsModule,
        FileHandlerComponent,
        ReactiveFormsModule
    ],
    templateUrl: './rw-kinerja-pending.component.html',
    styleUrl: './rw-kinerja-pending.component.scss'
})
export class RwKinerjaPendingComponent {
    pagable: Pagable
    refresh= false
    isDetailOpen = false
    rwKinerja = new RWKinerja()
    ratingKinerjaList: RatingKinerja[] = []
    predikatKinerjaList: PredikatKinerja[] = []
    pendingTask: PendingTask

    rwKinerjaLoading$ = new BehaviorSubject<boolean>(false)
    predikatLoading$ = new BehaviorSubject<boolean>(false)
    ratingLoading$ = new BehaviorSubject<boolean>(false)
    submitLoading$ = new BehaviorSubject<boolean>(false)

    rwKinerjaForm!: FormGroup
    isAnnual: boolean = false
    years: number[] = []
    months = [
        { value: '01', name: 'Januari' },
        { value: '02', name: 'Februari' },
        { value: '03', name: 'Maret' },
        { value: '04', name: 'April' },
        { value: '05', name: 'Mei' },
        { value: '06', name: 'Juni' },
        { value: '07', name: 'Juli' },
        { value: '08', name: 'Agustus' },
        { value: '09', name: 'September' },
        { value: '10', name: 'Oktober' },
        { value: '11', name: 'November' },
        { value: '12', name: 'Desember' }
    ]

    inputs: FIleHandler

    constructor (
        private apiService: ApiService,
        private handlerService: HandlerService,
        private confirmationService: ConfirmationService,
        private formValidationService: FormValidationService,
        private pendingTaskService: PendingTaskService
    ) {}

    ngOnInit () {
        this.populateYears()
        this.handlePagable()
        this.handleFormInit()
        this.handleSubscribe()
    }

    populateYears () {
        const currentYear = new Date().getFullYear()
        for (let i = currentYear; i >= currentYear - 20; i--) {
            this.years.push(i)
        }
    }

    getErrorMessage (controlName: string, label: string): string | null {
        return this.formValidationService.getErrorMessage(
            this.rwKinerjaForm.get(controlName),
            controlName,
            label
        )
    }

    handlePagable () {
        this.pagable = new PagableBuilder('/api/v1/rw_kinerja/task/search')
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Tanggal', 'dateCreated').build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder(
                    'Akumulasi Angka Kredit',
                    'objectName',
                ).build(),
            )
            .addPrimaryColumn(
                new PrimaryColumnBuilder('Status', 'flowName').build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((pendingTask: PendingTask) => {
                        this.pendingTask = pendingTask
                        if (pendingTask.flowId == 'siap_flow_2') {
                            this.getRatingKinerjaList(this.pendingTask.id)
                            this.getPredikatKinerjaList()
                            this.isDetailOpen = true
                        }
                    }, 'info')
                    .addInactiveCondition(
                        (pendingTask: PendingTask) =>
                            pendingTask.flowId == 'siap_flow_1',
                    )
                    .withIcon('update')
                    .build(),
            )
            .addActionColumn(
                new ActionColumnBuilder()
                    .setAction((pendingTask: PendingTask) => {
                        this.deletePendingTask(pendingTask)
                    }, 'danger')
                    .withIcon('danger')
                    .build(),
            )
            .build()
    }

    deletePendingTask (pendingTask: PendingTask) {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return

                this.pendingTaskService
                    .deletePendingTaskByInstanceId(pendingTask.instanceId)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menghapus data antrian'
                            )
                            this.refresh = !this.refresh
                        },
                        error: error => {
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menghapus data antrian'
                            )
                        }
                    })
            }
        })
    }

    handleFormInit () {
        this.rwKinerjaForm = new FormGroup({
            predikatKinerjaId: new FormControl('', [Validators.required]),
            ratingHasilId: new FormControl('', [Validators.required]),
            ratingKinerjaId: new FormControl('', [Validators.required]),
            type: new FormControl('', [Validators.required]),
            angkaKredit: new FormControl('', [
                Validators.required,
                Validators.pattern('^[0-9]+(\\.[0-9]+)?$')
            ]),
            fileDocEvaluasi: new FormControl('', [Validators.required]),
            fileDocPredikat: new FormControl('', [Validators.required]),
            fileDocAkumulasiAk: new FormControl('', [Validators.required]),
            fileDocPenetapanAk: new FormControl('', [Validators.required]),
            year: new FormControl('', [Validators.required]),
            monthStart: new FormControl('', []),
            monthEnd: new FormControl('', []),
            // Hidden controls for actual date values
            dateStart: new FormControl('', [Validators.required]),
            dateEnd: new FormControl('', [Validators.required])
        })
    }

    patchFormValue () {
        const data = this.rwKinerja

        this.rwKinerjaForm.patchValue({
            dateEnd: data.dateEnd,
            dateStart: data.dateStart,
            predikatKinerjaId: data.predikatKinerjaId,
            ratingHasilId: data.ratingHasilId,
            ratingKinerjaId: data.ratingKinerjaId,
            type: data.type,
            angkaKredit: data.angkaKredit
        })

        this.isAnnual = data.type === 'tahunan'
        this.updateFormControlsForType(data.type)

        if (this.isAnnual) {
            const year = new Date(data.dateStart).getFullYear()
            this.rwKinerjaForm.get('year')?.setValue(year)
        } else {
            const startDate = new Date(data.dateStart)
            const endDate = new Date(data.dateEnd)

            this.rwKinerjaForm.get('year')?.setValue(startDate.getFullYear()) // shared year
            this.rwKinerjaForm
                .get('monthStart')
                ?.setValue(
                    (startDate.getMonth() + 1).toString().padStart(2, '0')
                )
            this.rwKinerjaForm
                .get('monthEnd')
                ?.setValue((endDate.getMonth() + 1).toString().padStart(2, '0'))
        }

        // Re-run date calculation logic
        if (this.isAnnual) {
            this.onYearSelected()
        } else {
            this.onMonthRangeSelected()
        }
    }

    handleSubscribe () {
        const typeControl = this.rwKinerjaForm.get('type')
        typeControl?.valueChanges.subscribe(type => {
            this.isAnnual = type === 'tahunan'
            this.updateFormControlsForType(type)
        })
    }

    updateFormControlsForType (type: string) {
        if (type === 'tahunan') {
            this.rwKinerjaForm.removeControl('monthStart')
            this.rwKinerjaForm.removeControl('monthEnd')
        } else if (type === 'bulanan') {
            this.rwKinerjaForm.addControl(
                'monthStart',
                new FormControl('', Validators.required)
            )
            this.rwKinerjaForm.addControl(
                'monthEnd',
                new FormControl('', Validators.required)
            )
        }
        this.rwKinerjaForm.get('dateStart')?.setValue('')
        this.rwKinerjaForm.get('dateEnd')?.setValue('')

        if (this.isAnnual) {
            this.onYearSelected()
        } else {
            this.onMonthRangeSelected()
        }
    }

    onYearSelected () {
        const year = this.rwKinerjaForm.get('year')?.value
        this.rwKinerjaForm.get('dateStart')?.setValue(`${year}-01-01`)
        this.rwKinerjaForm.get('dateEnd')?.setValue(`${year}-12-31`)
    }

    onMonthRangeSelected () {
        const startMonth = this.rwKinerjaForm.get('monthStart')?.value
        const endMonth = this.rwKinerjaForm.get('monthEnd')?.value
        const selectedYear = this.rwKinerjaForm.get('year')?.value

        console.log(startMonth, endMonth, selectedYear)

        if (startMonth && endMonth && selectedYear) {
            const startDate = new Date(
                selectedYear,
                parseInt(startMonth) - 1,
                1
            )
            const endDate = new Date(selectedYear, parseInt(endMonth), 0)

            if (parseInt(startMonth) > parseInt(endMonth)) {
                this.rwKinerjaForm
                    .get('monthEnd')
                    ?.setErrors({ monthOrder: true })
                this.rwKinerjaForm.get('dateStart')?.setValue('')
                this.rwKinerjaForm.get('dateEnd')?.setValue('')
                return
            } else {
                this.rwKinerjaForm.get('monthEnd')?.setErrors(null)
            }

            this.rwKinerjaForm
                .get('dateStart')
                ?.setValue(this.formatDate(startDate))
            this.rwKinerjaForm
                .get('dateEnd')
                ?.setValue(this.formatDate(endDate))
        } else {
            this.rwKinerjaForm.get('dateStart')?.setValue('')
            this.rwKinerjaForm.get('dateEnd')?.setValue('')
        }
    }

    formatDate (date: Date): string {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    fileLoadHandler () {
        this.inputs = {
            files: {
                docEvaluas: {
                    label: 'Upload Dokumen Evaluasi Kinerja',
                    source: this.rwKinerja.docEvaluasiUrl,
                    fileName: this.rwKinerja.docEvaluasi,
                    required: true
                },
                docPredikat: {
                    label: 'Upload Dokumen Konversi Predikat Kinerja',
                    source: this.rwKinerja.docPredikatUrl,
                    fileName: this.rwKinerja.docPredikat,
                    required: true
                },
                docAkumulasiAk: {
                    label: 'Upload Dokumen Akumulasi Angka Kredit',
                    source: this.rwKinerja.docAkumulasiAkUrl,
                    fileName: this.rwKinerja.docAkumulasiAk,
                    required: true
                },
                docPenetapanAk: {
                    label: 'Upload Dokumen Penetapan Angka Kredit',
                    source: this.rwKinerja.docPenetapanAkUrl,
                    fileName: this.rwKinerja.docPenetapanAk,
                    required: true
                }
            },
            maxSize: 2 * 1024 * 1024,
            allowedTypes: [{ type: 'application/pdf' }],
            listen: (key: string, source: string, base64Data: string) => {
                if (key == 'docEvaluas')
                    this.rwKinerjaForm.patchValue({
                        fileDocEvaluasi: base64Data
                    })
                if (key == 'docPredikat')
                    this.rwKinerjaForm.patchValue({
                        fileDocPredikat: base64Data
                    })
                if (key == 'docAkumulasiAk')
                    this.rwKinerjaForm.patchValue({
                        fileDocAkumulasiAk: base64Data
                    })
                if (key == 'docPenetapanAk')
                    this.rwKinerjaForm.patchValue({
                        fileDocPenetapanAk: base64Data
                    })
            }
        }
    }

    getRatingKinerjaList (pending_task_id: string) {
        this.ratingLoading$.next(true)
        this.apiService.getData(`/api/v1/rating_kinerja`).subscribe({
            next: response => {
                this.ratingKinerjaList = response.map(
                    (ratingKinerja: { [key: string]: any }) =>
                        new RatingKinerja(ratingKinerja)
                )
                this.getPendingRWKinerja(pending_task_id)
                this.ratingLoading$.next(false)
            },
            error: error => {
                console.log('error', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data rating kinerja'
                )
                this.ratingLoading$.next(false)
            }
        })
    }

    getPredikatKinerjaList () {
        this.predikatLoading$.next(true)
        this.apiService.getData(`/api/v1/predikat_kinerja`).subscribe({
            next: response => {
                this.predikatKinerjaList = response.map(
                    (predikatKinerja: { [key: string]: any }) =>
                        new PredikatKinerja(predikatKinerja)
                )
                this.predikatLoading$.next(false)
            },
            error: error => {
                console.log('error', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data predikat kinerja'
                )
                this.predikatLoading$.next(false)
            }
        })
    }

    getPendingRWKinerja (id: string) {
        this.rwKinerjaLoading$.next(true)
        this.apiService.getData(`/api/v1/pending_task/${id}`).subscribe({
            next: response => {
                const pendingTask = new PendingTask(response)
                this.rwKinerja = new RWKinerja(pendingTask.objectTask.object)
                this.fileLoadHandler()
                this.patchFormValue()
                this.rwKinerjaLoading$.next(false)
            },
            error: error => {
                console.log('error', error)
                this.handlerService.handleAlert(
                    'Error',
                    'Gagal mengambil data riwayat kinerja'
                )
                this.rwKinerjaLoading$.next(false)
            }
        })
    }

    back () {
        this.ratingKinerjaList = []
        this.predikatKinerjaList = []
        this.pendingTask = null
        this.isDetailOpen = false
        this.rwKinerja = new RWKinerja()
    }

    handlePayload () {
        this.rwKinerja.dateEnd = this.rwKinerjaForm.value.dateEnd
        this.rwKinerja.dateStart = this.rwKinerjaForm.value.dateStart
        this.rwKinerja.predikatKinerjaId =
            this.rwKinerjaForm.value.predikatKinerjaId
        this.rwKinerja.ratingHasilId = this.rwKinerjaForm.value.ratingHasilId
        this.rwKinerja.ratingKinerjaId =
            this.rwKinerjaForm.value.ratingKinerjaId
        this.rwKinerja.type = this.rwKinerjaForm.value.type
        this.rwKinerja.angkaKredit = this.rwKinerjaForm.value.angkaKredit
        this.rwKinerja.fileDocEvaluasi =
            this.rwKinerjaForm.value.fileDocEvaluasi
        this.rwKinerja.fileDocPredikat =
            this.rwKinerjaForm.value.fileDocPredikat
        this.rwKinerja.fileDocAkumulasiAk =
            this.rwKinerjaForm.value.fileDocAkumulasiAk
        this.rwKinerja.fileDocPenetapanAk =
            this.rwKinerjaForm.value.fileDocPenetapanAk
    }

    submit () {
        this.confirmationService.open(false).subscribe({
            next: result => {
                if (!result.confirmed) return
                this.submitLoading$.next(true)

                // this.handlePayload()
                this.rwKinerja = new RWKinerja(this.rwKinerjaForm.value)
                const task = new Task()
                task.id = this.pendingTask.id
                task.taskAction = 'approve'
                task.object = this.rwKinerja

                this.apiService
                    .postData(`/api/v1/rw_kinerja/task/submit`, task)
                    .subscribe({
                        next: () => {
                            this.handlerService.handleAlert(
                                'Success',
                                'Berhasil menyimpan perubahan data'
                            )
                            this.submitLoading$.next(false)
                            this.back()
                        },
                        error: error => {
                            console.log('error', error)
                            this.handlerService.handleAlert(
                                'Error',
                                'Gagal menyimpan perubahan data'
                            )
                            this.submitLoading$.next(false)
                        }
                    })
            }
        })
    }
}
